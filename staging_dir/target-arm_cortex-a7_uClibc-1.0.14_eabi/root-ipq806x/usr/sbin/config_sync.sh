#!/bin/sh

WDIR=/tmp/config_sync
mkdir -p ${WDIR}/2sync

[ -z $1 ] && exit 0

role=$1

cleanup(){
	uci commit gl_son
}

trap 'cleanup; exit 0' SIGTERM

INIT=$(uci get gl_son.general.initted)
GW_IP=`ip route | grep default |  cut -f3 -d" "`

re_config_sync_init(){
	#等待wps获取psk
	while true; do
		psk=$(uci get wireless.bh_ap_wifi1.key)
		[ "$psk" != "" -a "$psk" != "goodlife" ] && break
		sleep 3
		logger -t config_sync -p notice "wait wps key"
	done

	#配置root密码（也是ftp的密码）为psk
	(echo "$psk"; sleep 1; echo "$psk") | passwd root >/dev/null 2>&1

	#开启ftpd、配置文件在/etc/inetd.conf中写好
	/etc/init.d/inetd restart

	#生成副路由公钥到/re_key.pub
	rm -fr /root/ssh/
	mkdir -p /root/ssh/.ssh
	touch /root/ssh/.ssh/keepme
	rm -f /cap_key.pub /re_key.pub
	#dropbearkey -t rsa -f /root/ssh/.ssh/id_rsa
	cp /etc/dropbear/dropbear_rsa_host_key /root/ssh/.ssh/id_rsa
	dropbearkey -y -f /root/ssh/.ssh/id_rsa | grep "^ssh-rsa " > /root/ssh/.ssh/id_rsa.pub
	cp /root/ssh/.ssh/id_rsa.pub /re_key.pub
}

re_conf_op(){
	local restart_repacd glconfig_changed

	cd ${WDIR}/2sync
	scp -i /root/ssh/.ssh/id_rsa root@$GW_IP:${WDIR}/2sync/* ${WDIR}/2sync >/dev/null 2>&1
	[ -f shadow ] && cp shadow /etc && rm -f shadow
	[ -f wireless ] && restart_repacd=1 && sh wireless
	[ -f glconfig ] && glconfig_changed=1
	rm -f wireless
	cp ${WDIR}/2sync/* /etc/config
	rm -f ${WDIR}/2sync/*

	# 一般来说ssh会很快完成，完成之后在进行后续操作（repacd重启会断开wifi）
	while true; do
		timeout -t 25 ssh -i /root/ssh/.ssh/id_rsa root@$GW_IP "/sbin/uci set gl_son.${re_mac_uci}.change_wait=0; /sbin/uci commit gl_son"
		[ $? = 0 ] && break
		sleep 2.5
	done
	logger -t config_sync -p notice "NonCAP config synced"

	#关闭自动升级
	uci set glconfig.autoupdate.enable=0
	uci commit glconfig

	if [ "$restart_repacd" = 1 ]; then
		ubus call mqtt notify
	fi

	if [ "$glconfig_changed" = 1 ]; then
		/etc/init.d/gl_mqtt restart
	fi

	# 重启repacd
	[ "$restart_repacd" = 1 ] && /etc/init.d/repacd restart
}

# 参数1：副路由mac，为空则为所有副路由
cap_conf_prepare(){
	#拷贝待同步的配置文件到2sync目录：目前有/etc/shadow和/etc/config/glconfig
	for conf_file in "$(uci get gl_son.confs.conf)"; do
		cp $conf_file ${WDIR}/2sync
	done
	#config_sync_change_trigger.sh程序准备fronthaul无线ssid和密码到wireless文件、拷贝到2sync目录
	/usr/sbin/config_sync_change_trigger.sh wireless $1
}

flash_keep(){
	echo '/etc/config.tar' >>/etc/sysupgrade.conf
	echo '/etc/re_keys/' >>/etc/sysupgrade.conf
	echo '/etc/glproduct' >>/etc/sysupgrade.conf
	echo '/root/ssh/.ssh/' >>/etc/sysupgrade.conf
	echo '/cap_key.pub' >>/etc/sysupgrade.conf
	echo '/re_key.pub' >>/etc/sysupgrade.conf
}

toggle_power(){
	ssdk_sh debug phy set 2 0 0x840; ssdk_sh debug phy set 3 0 0x840; ssdk_sh debug phy set 4 0 0x840
	sleep 0.5
	ssdk_sh debug phy set 2 0 0x1240; ssdk_sh debug phy set 3 0 0x1240; ssdk_sh debug phy set 4 0 0x1240
}

init_setting(){
	if [ "$role" = CAP ]; then
		#获取主路由公钥
		CAP_IP=`ifconfig br-lan | grep "inet addr" | awk '{print $2}' | cut -f2 -d":"`
		dropbearkey -f /etc/dropbear/dropbear_rsa_host_key -y | sed -n 2p | cut -f2 -d" ">/tmp/cap_key.pub
		echo "$CAP_IP ssh-rsa $(cat /tmp/cap_key.pub)" >/etc/dropbear/cap_key.pub
		rm -f /tmp/cap_key.pub
		cap_conf_prepare
		mkdir -p /etc/re_keys
		touch /etc/re_keys/keepme
		logger -t config_sync -p notice "CAP: init done"
	fi
	if [ "$role" = NonCAP ]; then
		toggle_power
		re_config_sync_init
		logger -t config_sync -p notice "NonCAP: init done"
	fi
	flash_keep
	uci set gl_son.general.initted=1
	uci commit gl_son
}

if [ "$INIT" = 0 ]; then
	init_setting
fi
#########################################
#主路由循环
#########################################
if [ "$role" = "CAP" ]; then
	uci_change=0
	key=$(uci get wireless.bh_ap_wifi1.key)
	while true; do
		( echo 'td s'; sleep 5; echo 'q'; ) | hyt >${WDIR}/td_s
		#re_macs_prep=$(cat ${WDIR}/td_s | grep "#.*:")
		#re_macs=$(echo ${re_macs_prep#*device: } | cut -f1 -d"," | grep -E "E4:95:6E|94:83:C4")
		re_macs=$(cat ${WDIR}/td_s | grep "#.*:" | awk -F "device: " '{print $2}' | cut -f1 -d"," | grep -E "E4:95:6E|94:83:C4")

		sync_change_wait=0

		[ -z "$re_macs" ] && sleep 10 && continue

		# 对td_s拓扑信息里的每一个re做操作
		for re_mac in $re_macs; do
			# 有线backhaul
			re_bh_eth_mac=$(sed -n "/${re_mac}/,/#/p" ${WDIR}/td_s | sed -n "/Interface name/,/^$/p" | sed -n '/^[ \t].*eth/p' | awk '{print $3}' | tr "\n" " " | sed "s/ $//g")
			# 无线backhual
			re_bh_sta_mac=$(sed -n "/${re_mac}/,/#/p" ${WDIR}/td_s | sed -n "/Interface name/,/^$/p" | sed -n '/^[ \t].*ath/p' | awk '{print $3}' | tr "\n" " " | sed "s/ $//g")
			re_mac_uci=`echo "$re_mac" | tr -d ":"`
			re_ip=$(cat ${WDIR}/td_s | grep "#.*:"  | grep $re_mac | awk '{print $9}')
			if [ -z "`cat ${WDIR}/td_s | grep "#.*:"  | grep "IPv4 address"`" ]; then
				#td_s没有ip信息，通过arp获取
				re_ip="`cat /proc/net/arp | grep -i $re_mac | awk '{print $1}'`"
			fi

			# 此re的mac未被记入gl_son配置文件
			if [ "`uci -q get gl_son.$re_mac_uci`" = "" ]; then
				uci set gl_son.$re_mac_uci=re
				# re_mac_uci这个mac地址的副路由等待配置同步
				uci set gl_son.${re_mac_uci}.change_wait=1
				uci_change=1
			fi

			# 存储副路由的中继接口的mac，仅保存一次
			uci_bh_sta_mac="`uci -q get gl_son.${re_mac_uci}.bh_sta_mac`"
			if [ -n "$re_bh_sta_mac" -a -z "$uci_bh_sta_mac" ]; then
				if [ "$uci_bh_sta_mac" != "$re_bh_sta_mac" ]; then
					uci set gl_son.${re_mac_uci}.bh_sta_mac="$re_bh_sta_mac"
					uci_change=1
				fi
			fi
			# 实时更新是否eth backhual
			uci_bh_eth_mac="`uci -q get gl_son.${re_mac_uci}.bh_eth_mac`"
			if [ "$uci_bh_eth_mac" != "$re_bh_eth_mac" ]; then
				uci set gl_son.${re_mac_uci}.bh_eth_mac="$re_bh_eth_mac"
				uci_change=1
			fi

			# re的ip地址有更新
			uci_ip="`uci -q get gl_son.${re_mac_uci}.ip`"
			if [ "$uci_ip" != "$re_ip" ]; then
				uci set gl_son.${re_mac_uci}.ip="$re_ip"
				uci_change=1
			fi

			# re的配置同步阶段、如果re刚刚mesh上，进入阶段1即ftp阶段
			stage=`uci get gl_son.${re_mac_uci}.conf_sync_stage`
			if [ "$stage" = "" ]; then
				uci set gl_son.${re_mac_uci}.conf_sync_stage=ftp
				uci_change=1
			fi

			# ftp阶段操作
			if [ "$stage" = "" -o "$stage" = "ftp" -a -n "$re_ip" ]; then
				logger -t config_sync -p notice "public key transftering for $re_mac, $re_ip"
				# 获取re_key.pub
				ftpget -u root -p "$key" "$re_ip" /etc/re_keys/re_key.pub_$re_mac_uci re_key.pub
				ret0=$?
				# 传送cap_key.pub
				ftpput -u root -p "$key" "$re_ip" cap_key.pub /etc/dropbear/cap_key.pub
				ret1=$?
				if [ "$ret0" = 0 -a "$ret1" = 0 ]; then
					# ftp的下一阶段是ssh
					uci set gl_son.${re_mac_uci}.conf_sync_stage="ssh"
					uci_change=1
					# 把re_key.pub增加到authorized_keys
					cat /etc/re_keys/re_key.pub_$re_mac_uci >>/etc/dropbear/authorized_keys
				fi
			fi
			change_wait=$(uci get gl_son.${re_mac_uci}.change_wait)
			[ "$change_wait" = 1 ] && cap_conf_prepare $re_mac_uci
			sync_change_wait=$(($sync_change_wait + $change_wait))
		done
		if [ -n "$re_macs" ]; then
			if [ "$sync_change_wait" = 0 ]; then
				rm -f ${WDIR}/2sync/*
				echo "nothing to be synced"
			else
				echo "conf to sync: `ls ${WDIR}/2sync/ 2>/dev/null`"
			fi
		fi
		[ "$uci_change" = 1 ] && uci commit gl_son
		sleep 10
	done
fi
##########################################
#副路由循环：
##########################################

#compares two version
has_new_version(){
	current_version=$1 #e.g. 0.99-14-ath9k
	newest_version=$2 #e.g. 0.99
	#we only compare 1st and 2nd number, the 3rd are only description, will not compare
	old_main=$(echo "$current_version"|awk -F- '{print $1}')
	old_sub=$(echo "$current_version"|awk -F- '{print $2}')
	new_main=$(echo "$newest_version"|awk -F- '{print $1}')
	new_sub=$(echo "$newest_version"|awk -F- '{print $2}')
	var=$(awk 'BEGIN{ print "'$old_main'"<"'$new_main'" }')
	#main version is newer
	if [ "$var" -eq 1 ]; then
		echo yes
		return
	#main version is equal, compare sub version
	elif [ "$old_main" = "$new_main" ]; then
		var=$(awk 'BEGIN{ print "'$old_sub'"<"'$new_sub'" }')
		#sub version is newer
		if [ "$var" -eq 1 ]; then
			echo yes
			return
		fi
	fi

	echo no

}

re_sysupgrade(){
	local cap_version=$1
	. /lib/functions/gl_util.sh
	firmware_path=$(get_firmware_download_url)

	touch $WDIR/downloading
	curl -f -s --connect-timeout 5 ${firmware_path}/list.txt -o /tmp/firmware_list
	version_list=$(cat /tmp/firmware_list)
	file=$(echo "$version_list" |awk -v cap_version="$cap_version" '$1==cap_version {print $2}')
	md5_check=$(echo "$version_list" |awk -v cap_version="$cap_version" '$1==cap_version {print $3}')
	if [ -z "$file" ]; then
		rm -f $WDIR/downloading
		return
	fi
	echo "found new version, will download now"
	curl -s --connect-timeout 5 "${firmware_path}/$file"  -o /tmp/firmware.img.tmp >> /dev/null
	mv /tmp/firmware.img.tmp /tmp/firmware.img
	rm -f $WDIR/downloading
	#after download, do a md5 check
	md5=$(md5sum /tmp/firmware.img |awk '{print $1}')
	if [ "$md5" != "$md5_check" ]; then
		rm -fr /tmp/firmware.img
	else
		#the file is correct, let's update
		echo -----------------------------------------
		echo -------will upgrade firmware-------------
		echo -----------------------------------------
		sleep 10
		/usr/bin/flashleds &
		killall dropbear lighttpd
		/sbin/sysupgrade -c /tmp/firmware.img
	fi
}

if [ "$role" = "NonCAP" ]; then
	re_mac_uci=$(ifconfig br-lan  | grep HWaddr | cut -f9 -d" " | tr -d ":")
	ftp_closed=0
	export HOME=/root/ssh
	while true; do
		if [ -f /cap_key.pub ]; then
			[ ! -f /root/ssh/.ssh/known_hosts ] && cat /cap_key.pub >/root/ssh/.ssh/known_hosts
			GW_IP=`ip route | grep default |  cut -f3 -d" "`
			[ -z "$GW_IP" ] && sleep 15 && continue
			gw_ip_known_host=$(cat /root/ssh/.ssh/known_hosts | awk '{print $1}')
			if [ "$gw_ip_known_host" != "$GW_IP" ]; then
				toggle_power
				sed -i "s/${gw_ip_known_host}/${GW_IP}/" /root/ssh/.ssh/known_hosts
			fi
			if [ -f /root/ssh/.ssh/known_hosts ]; then
				change_probe=$(HOME=/root/ssh timeout -t 25 ssh -i /root/ssh/.ssh/id_rsa root@$GW_IP "/bin/cat /etc/glversion; /sbin/uci -q get gl_son.${re_mac_uci}.change_wait; /bin/cat /tmp/sysinfo/board_name_alias")
			fi
			cap_version=$(echo "$change_probe" | sed -n "1p")
			change_wait=$(echo "$change_probe" | sed -n "2p")
			cap_model=$(echo "$change_probe" | sed -n "3p")
			if [ "$change_wait" = 0 -o "$change_wait" = 1 ];then
				if [ $ftp_closed = 0 ]; then
					/etc/init.d/inetd stop
					/etc/init.d/dnsmasq restart
					ftp_closed=1
					uci set gl_son.general.synced=1
					uci commit gl_son
				fi
				if [ "$change_wait" = 1 ]; then
					re_conf_op
				else
					echo "nothing to sync"
				fi
				if [ " $cap_model" = " $(cat /tmp/sysinfo/board_name_alias)" ]; then
					if [ ! -f ${WDIR}/downloading ]; then
						current_version=$(cat /etc/glversion)
						has_new=$(has_new_version $current_version $cap_version)
						if [ "$has_new" = "yes" ]; then
							re_sysupgrade $cap_version
						fi
					fi
				fi
			else
				logger -t config_sync -p notice "NonCAP: ssh fail"
			fi
		fi
		sleep 15
	done
fi

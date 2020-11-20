#!/bin/sh

. /lib/functions/gl_util.sh

mesh_en=$(uci -q get repacd.repacd.Enable)
[ "$mesh_en" != "1" ] && exit 0

if [ -z "$(uci -q get network.wan)" ]; then
	role=NonCAP
else
	role=CAP
fi

fix_2x_backup(){
	sh /rom/etc/uci-defaults/101-upgrade_from_2_x_firmware

	uci set wireless.wifi0.band='2G'
	uci set wireless.wifi1.htmode='VHT80'
	uci set wireless.wifi1.band='5G'
	uci set wireless.wifi0.country=$(get_country_code)
	uci set wireless.wifi1.country=$(get_country_code)
	uci commit wireless
	if [ -z "$(uci -q get wireless.wifi0.txpower_max)" -o -z "$(uci -q get wireless.wifi1.txpower_max)" ]; then
		uci set wireless.wifi0.txpower_backup=$(uci -q get wireless.wifi0.txpower)
		uci set wireless.wifi1.txpower_backup=$(uci -q get wireless.wifi1.txpower)
		uci delete wireless.wifi0.txpower
		uci delete wireless.wifi1.txpower
		uci commit wireless
		wifi
	fi
	uci delete glconfig.modem
	uci set glconfig.modem=server
	uci add_list glconfig.modem.bus=1-1
	uci commit glconfig
	if [ -z "$(uci -q get wireless.wifi0.txpower_max)" -o -z "$(uci -q get wireless.wifi1.txpower_max)" ]; then
		/usr/sbin/b1300_misc_func.sh set_max_power &
	fi
}

do_de_mesh(){
	echo timer >/sys/class/leds/mesh_led/trigger
	echo 250 >/sys/class/leds/mesh_led/delay_off
	echo 250 >/sys/class/leds/mesh_led/delay_on
	# sed -i "/mesh/d" /etc/glproduct
	uci delete glconfig.bridge
	uci commit glconfig
	cloud_en=$(uci -q get glconfig.cloud.enable)
	[ "$cloud_en" = "1" ] && ubus call mqtt notify
	/etc/init.d/inetd stop
	/etc/init.d/repacd stop
	/etc/init.d/wsplcd stop
	/etc/init.d/hyd stop
	cd /etc
	tar xf config.tar
	rm -f config.tar
	uci set gl_son.general.initted=0
	uci commit gl_son
	uci set repacd.repacd.Enable=0
	uci commit repacd
	uci set hyd.config.Enable=0
	uci commit hyd
	uci set wsplcd.config.HyFiSecurity=0
	uci commit wsplcd
	[ -z "$(uci wireless.wifi0.band)" ] && fix_2x_backup
	sleep 5
	sync
	rm -f /tmp/config_sync/td_s*
	echo none >/sys/class/leds/mesh_led/trigger
	echo 0 >/sys/class/leds/mesh_led/brightness
	/etc/init.d/network restart
	/etc/init.d/dnsmasq restart
	ssdk_sh debug phy set 2 0 0x840; ssdk_sh debug phy set 3 0 0x840; ssdk_sh debug phy set 4 0 0x840
	sleep 0.5
	ssdk_sh debug phy set 2 0 0x1240; ssdk_sh debug phy set 3 0 0x1240; ssdk_sh debug phy set 4 0 0x1240
}

if [ "$role" = "NonCAP" ]; then
	#re_mac_uci=$(ifconfig br-lan  | grep HWaddr | cut -f9 -d" " | tr -d ":")
	#GW_IP=`ip route | grep default |  cut -f3 -d" "`
	#export HOME=/root/ssh
	#if [ -f /root/ssh/.ssh/id_rsa -a -n "$GW_IP" ]; then
	#	ssh -i /root/ssh/.ssh/id_rsa root@$GW_IP "uci delete gl_son.${re_mac_uci}"
	#fi
	rm -f /cap_key.pub
	rm -f /re_key.pub
	rm -fr /root/ssh/
	/etc/init.d/lighttpd enable
	/etc/init.d/lighttpd start
	do_de_mesh
	/etc/init.d/gl_tertf start
else
	rm -f /etc/dropbear/authorized_keys
	rm -f /etc/dropbear/cap_key.pub
	rm -fr /etc/re_keys/
	do_de_mesh
	cloud_en=$(uci -q get glconfig.cloud.enable)
	[ "$cloud_en" = 1 ] && ubus call mqtt notify
fi

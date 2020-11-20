#!/bin/sh

[ -z $1 ] && exit 0

. /lib/functions.sh
. /lib/functions/system.sh

re_sta2_mac=
re_sta5_mac=

#处理副路由重新配对
update_re(){
	local bh_sta_mac
	local re_mac_uci=$1
	config_get bh_sta_mac "$1" bh_sta_mac
	if [ -n "$re_sta2_mac" ]; then
		have_re_sta2_mac=$(echo "$bh_sta_mac" | grep -i "$re_sta2_mac")
	fi
	if [ -n "$re_sta5_mac" ]; then
		have_re_sta5_mac=$(echo "$bh_sta_mac" | grep -i "$re_sta5_mac")
	fi
	if [ -n "$have_re_sta2_mac" -o -n "$have_re_sta5_mac" ];then
		uci set gl_son.$1.ip=""
		uci set gl_son.$1.conf_sync_stage="ftp"
		uci set gl_son.$1.change_wait="1"
		uci commit gl_son
		# 去除之前已有配对记录的authorized_keys
		if [ -f /etc/re_keys/re_key.pub_$re_mac_uci ]; then
			re_key_pub_content=$(cat /etc/re_keys/re_key.pub_$re_mac_uci | sed 's/\//\\\//g')
			sed -i "/${re_key_pub_content}/d" /etc/dropbear/authorized_keys
			rm -f /etc/re_keys/re_key.pub_$re_mac_uci
		fi
	fi
}

case "$1" in
cap_ip_change_trigger)
	new_ip=$(uci -q get network.lan.ipaddr)
	old_ip=$(cat /etc/dropbear/cap_key.pub  | awk '{print $1}')
	sed -i "s/${old_ip}/${new_ip}/" /etc/dropbear/cap_key.pub
	;;
re_repairing_config)
	re_sta2_mac=$(hostapd_cli -i ath01 -p /var/run/hostapd-wifi0 wps_get_status | grep "Peer Addr" | awk '{print $3}')
	re_sta5_mac=$(hostapd_cli -i ath11 -p /var/run/hostapd-wifi1 wps_get_status | grep "Peer Addr" | awk '{print $3}')
	config_load gl_son
	config_foreach update_re re
	;;
*)
	;;
esac


#!/bin/sh

#########################################
# 参数1： 待同步配置文件；[参数2]：副路由mac
#########################################
[ -z $1 ] && exit 0
WDIR=/tmp/config_sync

conf_file_name=$1
re_mac_uci=$2

set_change_wait(){
	if [ -n "$1" ]; then
		old_sets=$(uci show gl_son | grep change_wait | grep "$1")
	else
		old_sets=$(uci show gl_son | grep change_wait)
	fi
	for old_set in $old_sets; do
		new_set=$(echo $old_set | cut -f1 -d"=")'=1'
		uci set $new_set
	done
	uci commit gl_son
}

case "$conf_file_name" in
	*"wireless")
		ssid=$(uci get wireless.@wifi-iface[0].ssid | sed 's/\"/\\\"/g')
		encryption=$(uci get wireless.@wifi-iface[0].encryption)
		key=$(uci get wireless.@wifi-iface[0].key | sed 's/\"/\\\"/g')
		ssid_guest=$(uci get wireless.guest2g.ssid | sed 's/\"/\\\"/g')
		encryption_guest=$(uci get wireless.guest2g.encryption)
		key_guest=$(uci get wireless.guest2g.key | sed 's/\"/\\\"/g')
		guest_disabled=$(uci get wireless.guest2g.disabled)

		uci set wireless.guest5g.ssid=$ssid_guest
		uci set wireless.guest5g.encryption=$encryption_guest
		uci set wireless.guest5g.key="$key_guest"
		uci set wireless.guest5g.disabled=$guest_disabled
		uci commit wireless

		cat >${WDIR}/2sync/wireless <<EOF
uci set wireless.@wifi-iface[0].ssid="$ssid"
uci set wireless.@wifi-iface[0].encryption=$encryption
uci set wireless.@wifi-iface[0].key="$key"
uci commit wireless
EOF
		sleep 30 && ubus call mqtt notify &
		set_change_wait $re_mac_uci
		;;
	*"shadow")
		cp /etc/shadow $WDIR/2sync
		set_change_wait $re_mac_uci
		;;
	*"glconfig")
		cp /etc/config/glconfig $WDIR/2sync
		set_change_wait $re_mac_uci
		;;
	*)
		echo "invalid conf file"
		;;
esac



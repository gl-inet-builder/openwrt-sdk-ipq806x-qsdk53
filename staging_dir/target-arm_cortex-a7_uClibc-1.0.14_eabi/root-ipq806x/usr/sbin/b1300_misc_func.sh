#!/bin/sh

[ -z $1 ] && exit 0

case "$1" in
get_dfs_chan_list)
	[ -f /tmp/b1300_get_dfs_chan_list ] && cat /tmp/b1300_get_dfs_chan_list && exit 0
	lock -n /tmp/b1300_get_dfs_chan_list.lock
	[ $? != 0 ] && exit
	if [ -n "`cat /proc/net/dev| grep ath1`" ]; then
		ret=$(wlanconfig ath1 list chan  | grep '~' | awk '{print $2}')
	else
		wlanconfig ath68 create wlandev wifi1 wlanmode ap >/dev/null 2>&1
		ret=$(wlanconfig ath68 list chan  | grep '~' | awk '{print $2}')
		wlanconfig ath68 destroy
	fi
	echo "$ret" >/tmp/b1300_get_dfs_chan_list
	echo "$ret"
	lock -u /tmp/b1300_get_dfs_chan_list.lock
	;;
get_channels)
	device=$2
	[ "$device" = wifi0 -a -f /tmp/b1300_get_channels_wifi0 ] && cat /tmp/b1300_get_channels_wifi0 && exit 0
	[ "$device" = wifi1 -a -f /tmp/b1300_get_channels_wifi1 ] && cat /tmp/b1300_get_channels_wifi1 && exit 0
	lock -n /tmp/b1300_get_channels.lock
	[ $? != 0 ] && exit
	[ -z $2 ] && exit 0
	if [ "$device" = wifi0 ];then
		[ -f /tmp/b1300_get_channels_wifi0 ] && cat /tmp/b1300_get_channels_wifi0 && lock -u /tmp/b1300_get_channels.lock && exit 0
		if [ -n "`cat /proc/net/dev| grep ath0`" ]; then
			ret=$(iwinfo ath0 freqlist | awk -F 'Channel |)' '{print $2}')
		else
			ret=$(iwinfo wifi0 freqlist | awk -F 'Channel |)' '{print $2}')
		fi
		echo "$ret" >/tmp/b1300_get_channels_wifi0
		echo "$ret"
	else
		[ -f /tmp/b1300_get_channels_wifi1 ] && cat /tmp/b1300_get_channels_wifi1 && lock -u /tmp/b1300_get_channels.lock && exit 0
		if [ -n "`cat /proc/net/dev| grep ath1`" ]; then
			ret=$(wlanconfig ath1 list chan | grep -v '~' | awk '{print $2}')
		else
			wlanconfig ath68 create wlandev wifi1 wlanmode ap >/dev/null 2>&1
			ret=$(wlanconfig ath68 list chan | grep -v '~' | awk '{print $2}')
			wlanconfig ath68 destroy
		fi
		echo "$ret" >/tmp/b1300_get_channels_wifi1
		echo "$ret"
	fi
	lock -u /tmp/b1300_get_channels.lock
	;;
set_max_power)
	while true; do
		ret=$(iwinfo ath0 info | grep Tx-Power | awk -F ' ' '{print $2}')
		if [ -n "$ret" -a "$ret" -lt 31 ]; then
			#iwconfig ath0 chan 5
			#sleep 1
			ctl_max_2g=$ret
			uci set wireless.wifi0.txpower_max=$ctl_max_2g
			if [ -z "$(uci -q get wireless.wifi0.txpower)" ]; then
				uci set wireless.wifi0.txpower=$ctl_max_2g
			fi
			txpower_backup_wifi0=$(uci -q get wireless.wifi0.txpower_backup)
			if [ -n "$txpower_backup_wifi0" ]; then
				uci set wireless.wifi0.txpower=$txpower_backup_wifi0
				iwconfig ath0 txpower $txpower_backup_wifi0
			fi
			uci delete wireless.wifi0.txpower_backup
			uci commit wireless
			break
		fi
		sleep 1
	done
	while true; do
		ret=$(iwinfo ath1 info | grep Tx-Power | awk -F ' ' '{print $2}')
		if [ -n "$ret" -a "$ret" -lt 31 ]; then
			iwconfig ath1 chan 157
			sleep 3
			ctl_max_5g=$(iwinfo ath1 info | grep Tx-Power | awk -F ' ' '{print $2}')
			[ -z "$ctl_max_5g" ] && sleep 1 && continue
			uci set wireless.wifi1.txpower_max=$ctl_max_5g
			if [ -z "$(uci -q get wireless.wifi1.txpower)" ]; then
				uci set wireless.wifi1.txpower=$ctl_max_5g
			fi
			txpower_backup_wifi1=$(uci -q get wireless.wifi1.txpower_backup)
			if [ -n "$txpower_backup_wifi1" ]; then
				uci set wireless.wifi1.txpower=$txpower_backup_wifi1
				iwconfig ath1 txpower $txpower_backup_wifi1
			fi
			uci delete wireless.wifi1.txpower_backup
			uci commit wireless
			break
		fi
		sleep 1
	done
	;;
cap_ip_change_trigger)
	b1300_mesh_func.sh $1
	;;
re_repairing_config)
	b1300_mesh_func.sh $1
	;;
*)
	;;
esac


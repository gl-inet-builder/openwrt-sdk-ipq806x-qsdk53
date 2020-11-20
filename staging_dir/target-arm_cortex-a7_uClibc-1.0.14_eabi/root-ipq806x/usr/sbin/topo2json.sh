#!/bin/sh
INPUT=/tmp/config_sync/td_s.tmp
cp /tmp/config_sync/td_s $INPUT 2>/dev/null
last_c=$(tail -c 2 $INPUT)
[ "$last_c" != "@ " ] && exit 0

#lock -n /var/config_sync/topo2json.lock 2>/dev/null
#[ $? = 1 ] && exit 0

. /usr/share/libubox/jshn.sh

sed -i 's/@/\n/' $INPUT

cap_ath0_clients=$(sed -n '/Interface ath0:/,/^$/p'  $INPUT | sed '/^$/d' | sed '/Interface/d' | awk '{print $1}')
cap_ath1_clients=$(sed -n '/Interface ath1:/,/^$/p'  $INPUT | sed '/^$/d' | sed '/Interface/d' | awk '{print $1}')
cap_eth1_clients=$(sed -n '/Interface eth1:/,/^$/p'  $INPUT | sed '/^$/d' | sed '/Interface/d' | awk '{print $1}')

cap_mac=$(ifconfig br-lan | grep HWaddr | cut -f9 -d" ")

client_array(){
	local interface=$1 clients=$2
	json_add_array $interface
	for client in ${clients}; do
		json_add_string "" "${client}"
	done
	json_close_array
}

json_init
json_add_array "topos"
json_add_object
json_add_string "name" "Main Node"
json_add_string "mac" "$cap_mac"
#json_add_string "ip" "$cap_ip"
client_array "ath0" "$cap_ath0_clients"
client_array "ath1" "$cap_ath1_clients"
client_array "eth1" "$cap_eth1_clients"
json_close_object

re_macs=$(cat $INPUT  | grep "#.*:" | awk '{print $6}' | tr -d ',')
re_num=$(echo "$re_macs" |wc -l)
re_ips=$(cat $INPUT  | grep "#.*:" | awk '{print $9}' | tr -d ',')
re_macs_char=$(echo "$re_macs" |wc -c)

func_re_n_clients(){
	re_x_mac=$(echo "$re_macs" | sed -n "${1}p")
	re_x_ip=$(echo "$re_ips" | sed -n "${1}p")

	json_add_object
	json_add_string "name" "Sub Node $1"
	json_add_string "mac" "$re_x_mac"
	json_add_string "ip" "$re_x_ip"
	uci_re_x_mac=$(echo $re_x_mac | tr -d ":")
	bh_eth_mac=$(uci -q get gl_son.${uci_re_x_mac}.bh_eth_mac)
	if [ -n "$bh_eth_mac" ]; then
		json_add_string "bh_type" "eth"
	else
		json_add_string "bh_type" "wifi"
	fi

	re_x=`sed -n "/#$1/,/#/p" $INPUT | sed -n "/Address\t\t\t/,/^$/p" | awk '{print $1, $2}'`

	re_x_ath0_clients=$(echo "$re_x" | awk '$2==0{print $1}')
	client_array "ath0" "$re_x_ath0_clients"

	re_x_ath1_clients=$(echo "$re_x" | awk '$2==1{print $1}')
	client_array "ath1" "$re_x_ath1_clients"

	re_x_eth1_clients=$(echo "$re_x" | awk '$2==4||$2==5||$2==6{print $1}')
	client_array "eth1" "$re_x_eth1_clients"

	json_close_object
}

if [ "$re_macs_char" -gt 2 ]; then
	for i in $(seq 1 $re_num); do
		func_re_n_clients $i
	done
fi
json_close_array
json_dump -i

#lock -u /var/config_sync/topo2json.lock

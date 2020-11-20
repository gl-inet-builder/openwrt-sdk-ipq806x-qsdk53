#!/bin/sh

. /lib/mwan3/mwan3.sh
. /lib/functions/network.sh
. /lib/functions/gl_util.sh
model=$(get_model)
get_wan_interface()
{
     iface=`mwan3_report_policies_v4 2>/dev/null | grep % | awk '{print $1}'`
     if [ "$iface" != "" ];then
         for i in $iface; do
             if [ "$i" = "wwan" ];then
                 if [ "$model" = "b1300" -o "$model" = "s1300" -o "$model" = "ap1300" -o "$model" = "b2200" ];then
                     waniface="wlan-sta0"
                 elif [ "$model" = "mt300n-v2" -o "$model" = "vixmini" -o "$model" = "n300" ];then
                     waniface="apcli0"
                 else
                     waniface="wlan-sta"
                 fi
             else
                 network_get_device waniface $i
             fi
             if [ "$waniface" != "" ];then
                 break
             fi
         done
    else
         waniface=`ip route | grep default | head -n1 | awk '{print $5}'`
    fi
	echo "$waniface"
}
get_wan_interface

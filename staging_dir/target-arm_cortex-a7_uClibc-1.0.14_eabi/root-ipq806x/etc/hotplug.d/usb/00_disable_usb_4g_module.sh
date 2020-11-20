#!/bin/sh

model=$(awk -F': ' '/machine/ {print tolower($NF)}' /proc/cpuinfo |cut -d- -f2-)
if [ "$model" = "x1200" ];then
	BUS=$(echo $DEVPATH|cut -d '/' -f 8|cut -d ':' -f 1)
	if [ "$BUS" = "" ];then
		BUS=$(echo $DEVPATH|cut -d '/' -f 7|cut -d ':' -f 1)
	fi
	#echo "BUS:$BUS ACTION:$ACTION" >/dev/console
	if [ "$ACTION" = add -a "$BUS" = 1-1.4 ];then
		flag1=`uci get network.modem_1_1_2.disabled`
		flag2=`uci get network.modem_2_1_2.disabled`
		flag3=`uci get network.modem_1_1_4.disabled`
		if [ "$flag1" = 0 -a "$flag2" = 0 ];then
			if [ "$flag3" = 0 ];then
				uci set network.modem_1_1_4.disabled='1'
				uci commit network
				/etc/init.d/network reload
			fi
		fi
	else
		if [ "$ACTION" = remove -a "$BUS" = 1-1.2 ];then
			gl_uart 474c190100
		elif [ "$ACTION" = remove -a "$BUS" = 2-1.2 ];then
			gl_uart 474c1a0100
		fi
	fi
fi

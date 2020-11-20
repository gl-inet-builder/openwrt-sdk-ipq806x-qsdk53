#!/bin/sh
# rtc time sync script
# wellnw V1.0

if [ "$1" != "" ];then
	rtctime=`gl_uart 474c5000 | tail -n1 | awk '{print $2" "$4}'`
	date -s "$rtctime"
fi

flag=0
mode=`uci get glconfig.bridge.mode 2>/dev/null`
if [ "$mode" = "ap" -o "$mode" = "wds" -o "$mode" = "relay" ];then
	timeout -t 3 ping -c 3 8.8.8.8
	runflag="$?"
	while [ "$runflag" != 0 ]
	do
		sleep 60
		timeout -t 3 ping -c 3 8.8.8.8
		runflag="$?"
	done
	/etc/init.d/sysntpd restart
	flag=1
else
	num=`find /var/run/mwan3track/ -name STATUS 2>/dev/null| wc -l`
	while [ $(find /var/run/mwan3track/ -name STATUS 2>/dev/null| wc -l) -le 0 ]
	do
		sleep 30
	done
	while [ $num ]
	do
		file=`find /var/run/mwan3track/ -name STATUS 2>/dev/null| head -n$num`
		for i in $file
		do
			status=`cat $i`
			if [ "$status" = "online" ];then
				/etc/init.d/sysntpd restart
				flag=1
				break
			fi
			num=`expr $num - 1`
		done
		if [ "$flag" = 1 ];then
			break;
		else
			num=`find /var/run/mwan3track/ -name STATUS 2>/dev/null| wc -l`
			sleep 60
		fi
	done
fi


if [ "$flag" = 1 ];then
	sleep 10
	m=`date "+%S"` #second
	f=`date "+%M"` #minute
	s=`date "+%H"` #hour
	x=`date "+0%w"` #week
	d=`date "+%d"` #date
	y=`date "+%m"` #month
	n=`date "+%y"` #year
	ss=`printf %d 0x$s`
	sss=`expr $ss + 128`
	dd=`printf "%x" $sss`
	dd=${m}${f}${dd}${x}${d}${y}${n}
	gl_uart 474c5807$dd 1>/dev/null 2>&1 
	if [ "$?" != 0 ];then
		gl_uart 474c5807$dd 1>/dev/null 2>&1
	fi
fi


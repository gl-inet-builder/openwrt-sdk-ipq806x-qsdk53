/*
 * cmm.h
 * 
 * Created on: Fri 20 Apr 2018 09:43:56 AM CST
 *     Author: lancer
 *      Email: luoyejiang0701@qq.com
 */

#ifndef CMM_H
#define CMM_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>


bool cmm_check_file_is_exist (const char *name);
int cmm_check_factory(void);
bool cmm_check_file_include_data(const char *name);
bool cmm_net_reachable(void);


#endif /* CMM_H */


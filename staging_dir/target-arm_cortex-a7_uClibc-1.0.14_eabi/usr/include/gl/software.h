#ifndef __SOFTWARE_H__
#define __SOFTWARE_H__

/**********************************************************
Find the letter of package
#letter (m|str} letter
@packages {m|obj} package list
@count {m|int} package count
**********************************************************/
extern int find_letter(json_object* input,json_object* output);
/**********************************************************
Search the package contains the keyword
#keyword (m|str} keyword
@packages {m|obj} package list
@count {m|int} package count
**********************************************************/
extern int find_keyword(json_object* input,json_object* output);
/**********************************************************
list all packages
@updated {m|bool} 0:not update 1:updated
@packages {m|obj} package list
@count {m|int} package count
**********************************************************/
extern int list_package(json_object* input,json_object* output);

/**********************************************************
list installed packages
@packages {m|obj} package list
@count {m|int} package count
**********************************************************/
extern int list_installed(json_object* input,json_object* output);

/**********************************************************
install package
#name {m|str} package name
@stderr {m|str} output error infomation
@stout {m|str} output install infomation
**********************************************************/
extern int install_package(json_object* input,json_object* output);
/**********************************************************
remove package
#name {m|str} package name
@stderr {m|str} output error infomation
@stout {m|str} output remove infomation
**********************************************************/
extern int remove_package(json_object* input,json_object* output);
/**********************************************************
update packages
@updated {m|bool} 0:not update 1:updated
@stderr {m|str} output error infomation
@stout {m|str} output update infomation
**********************************************************/
extern int update_package(json_object* input,json_object* output);
#endif 

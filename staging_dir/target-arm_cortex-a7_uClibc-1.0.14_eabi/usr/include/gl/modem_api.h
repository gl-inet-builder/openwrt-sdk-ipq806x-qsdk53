#ifndef __MODEM_API_H__
#define __MODEM_API_H__
#include <json-c/json.h>

/** 获取路由器上猫的相关信息
* @modem_id {string}: 需要获取信息的modem id,如果没有输入该参数返回所有猫信息
* #modems {array|m}: 保护了所有猫的信息json array，每一个item包含如下信息
* 	modem_id, data_port, control_port, qmi_device, qmi_ifname, hostless_port, ncm_port, inuse
* Returns: 0=succeed, -1=???
*/
extern int get_modem_info(json_object *input, json_object *output);

/** 自动拨号
* @modem_id {string}: 需要获取信息的modem id,如果没有输入该参数返回所有猫信息
* Returns: 0=succeed, -1=???
*/
extern int modem_auto_connect(json_object *input, json_object *output);


/** 设定猫及carrier的信息
* @modem_id {string|m}: 要设置的的猫id
* @mode {string}: 上网的方式serial, qmi, ncm, tethering，如果不输入，自动选择最优方式
* @service {string}: 上网制式umts, evdo
* @device {string|m}: 要使用的设备，跟上网方式有关系，比如 /dev/ttyUSB3 /dev/cdc-ncm0 usb0
* @apn {string}: 缺省internet
* @dialnum {string}:
* @pin {string}:
* @username {string}:
* @password {string}:
* Returns: 0=succeed, -1=???
*/
extern int set_modem_config(json_object *input, json_object *output);

/** 获得猫的配置，这个是简单的读/etc/config/network
 * @modem_id {string|m}: 要获取的猫的ID，暂时不起作用
 * #proto {string}:
 * #device {string}:
 * #service {string}:
 * #apn {string}:
 * #dialnum {string}:
 * #pincode {string}:
 * #username {string}:
 * #password {string}:
 * Returns: 0=succeed, -1=???
 */
int get_modem_config(json_object *input, json_object *output);

/** 使能或者禁止modem连接
* @modem_id {string|m}: 要设置的的猫id
* @enable {bool}: 缺省true
* Returns: 0=succeed, -1=???
*/
extern int enable_modem(json_object *input, json_object *output);

/** 硬件重启猫
* @modem_id {string|m}: 要设置的的猫id
* Returns: 0=succeed, -1=???
*/
extern int reset_modem(json_object *input, json_object *output);

/** 获取现在收到的短信
* @modem_id {string}: 需要获取信息的modem id,如果没有输入该参数返回所有猫信息
* #messages {array|m}: 短信列表
*    from, time, body,
* Returns: 0=s ucceed, -1=???
*/
extern int list_modem_sms(json_object *input, json_object *output);

/** 删除短信
* @modem_id {string}: 需要获取信息的modem id,如果没有输入该参数返回所有猫信息
* #msg_id {int|m}: 要删除的短信编号
* Returns: 0=s ucceed, -1=???
*/
extern int delete_modem_sms(json_object *input, json_object *output);

/** 发送短信
* @modem_id {string}: 需要获取信息的modem id,如果没有输入该参数返回所有猫信息
* @number {string|m}: 要发送的电话号码
* @message {string|m}: 要发送的信息
* Returns: 0=s ucceed, -1=???
*/
extern int send_modem_sms(json_object *input, json_object *output);


extern int execute_modem_at(json_object *input, json_object *output);

/** 获取基站信息
* @modem_id {string}: 需要使用的猫ID
* Returns: 0=succeed
*/
extern int modem_get_cells(json_object * input, json_object * output);

extern int modem_get_iccid(json_object * input, json_object * output);

/*function define*/
extern int modem_mcu_interface(char* bus,json_object *output);

/***
 * @api {post} /modem/sim/switch /modem/sim/switch
 * @apiGroup modem
 * @apiVersion 1.0.0
 * @apiDescription modem sim switch.
 * @apiHeader {string} bus The bus of the modem.
 * @apiParam {integer} modem_id modem id
 * @apiHeader {string} sim_num The number of the sim.
 * @apiSuccess {integer} code return code.
 * @apiSuccess (Code) {integer} 0 success.
 * @apiSuccess (Code) {integer} -1 Invalid user, permission denied or not logged in!
 */
int modem_sim_switch(json_object * input, json_object * output);

int get_board_hw_and_sim_status(json_object * modem);

#endif

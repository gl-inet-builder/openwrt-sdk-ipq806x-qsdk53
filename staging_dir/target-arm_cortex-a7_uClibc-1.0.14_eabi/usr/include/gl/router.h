#ifndef _GL_ROUTER_H_
#define _GL_ROUTER_H_

#include <ifaddrs.h>
#include <json-c/json.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Get the router information in general
 * including, version, model, openwrt version, internet, mesh support
 */
extern int get_router();

/**
 * get_mac
 * get the mac address in xx:xx:xx:xx:xx:xx format for network interface
 * @ifname: eth0, eth1, br-lan, NULL for default address
 * return 0 if succeed
 */
extern int get_mac(const char* ifname, char value[]);
extern const char* get_default_mac();

/**
 * get_ip
 * @ifname, interface name, eth0, eth1, br-lan, wlan0, etc
 * @value: ip address in format xxx.xxx.xxx.xxx
 * return 0 if succeed
 */
extern int get_ip(const char* ifname, char value[]);

/**
 * get_network_info
 * @ifname: eth0, eth1, wlan0 etc
 * struct ifaddrs {
    struct ifaddrs *  ifa_next;
    char *            ifa_name;
    u_int             ifa_flags;
    struct sockaddr * ifa_addr;
    struct sockaddr * ifa_netmask;
    struct sockaddr * ifa_dstaddr;
    void *            ifa_data;
};
 */
extern int get_network_info(const char* ifname, struct ifaddrs value);

/**
 * get_ddns_name
 * get the ddns from flash
 * @value char[]
 */
const extern char* get_ddns_name();

/**
 * get_service_cde
 */
const extern char* get_service_code();

/**
 * get_mode_name
 * get the name of this router model, e.g. ar150, ar300m, mt300n etc
 */
const extern char* get_model_name();

extern int get_flash_ready();
extern int need_new_password();
extern const char* get_real_password_sha();

/**
 * get the wan information in json format
 * it contains proto, ip, status etc
 */
extern json_object* get_wan_info();

/**
 * get lan info in json formatint get_mac_hex(unsigned char* mac_hex);

 */
extern json_object* get_lan_info();

/**
 * get the wifi information in json formation
 * including status, disabled, ssid, etc.
 * @ifname, wlan0, wlan0-sta, NULL etc. If NULL get all
 */
extern json_object* get_wifi_info(const char* ifname);
extern json_object* get_wifi_all(const char* nothing);
extern json_object* get_wifi_devices(const char* nothing);
extern json_object* get_wifi_aps(const char* nothing);
extern json_object* get_wifi_sta(const char* nothing);
extern json_object* get_wifi_mesh(const char* nothing);

/**
 * Get the list of connected devices, by cable of wifi
 * @connection_type: cable, wifi
 */
extern json_object* get_clients(const char* connection_type);

/**
 * Get a list of storage devices and their status
 * including label, mount path, uuid, filesystem, size, available size,
 */
extern json_object* get_storage_devices();

/**
 * Get he mesh network information, including
 * nodes, links, network configuration
 */
extern json_object* get_mesh_network_info();

extern json_object* process_wifi(const char*);

extern json_object* get_wifi_scanlist(const char*);
extern int connect2wifi(char* ssid, char* encryption, char* key, int wds);
extern int generate_mt_mac(const char* mac, char* newmac);

/**************** functions below are wrappers for json-based communications *********************/


/**
 * Get the wan status of the router.
 * input: input parameters
 * output: the wan status info
 * Returns: 0=success, -1=error
 */
extern int get_wan_info_ex(json_object* input,json_object* output);

/**
 * Get the wifi status of the router.
 * input: input parameters
 * output: the wifi info
 * Returns: 0=success, -1=error
 */
extern int get_wifi_info_ex(json_object* input,json_object* output);


/**
 * Get the disk status of the router.
 * input: input parameters
 * output: the disk status
 * Returns: 0=success, -1=error
 */
extern int get_disk_info(json_object* input,json_object* output);

/**
 * Get the all the clients.
 * input: input parameters
 * output: the clients
 * Returns: 0=success, -1=error
 */
extern int get_clients_ex(json_object* input,json_object* output);



#ifdef __cplusplus
}
#endif

#endif

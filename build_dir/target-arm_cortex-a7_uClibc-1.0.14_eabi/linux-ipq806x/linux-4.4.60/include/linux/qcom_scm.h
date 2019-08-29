/* Copyright (c) 2010-2015, The Linux Foundation. All rights reserved.
 * Copyright (C) 2015 Linaro Ltd.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 and
 * only version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
#ifndef __QCOM_SCM_H
#define __QCOM_SCM_H

struct qcom_scm_tcsr_req {
	u32 mask;
	u32 status;
	u16 tcsr_reg;
	u16 set;
};

struct tzbsp_log_pos_t {
	uint16_t wrap;		/* Ring buffer wrap-around ctr */
	uint16_t offset;	/* Ring buffer current position */
};

struct tzbsp_diag_log_t {
	struct tzbsp_log_pos_t log_pos;	/* Ring buffer position mgmt */
	uint8_t log_buf[1];		/* Open ended array to the end
					 * of the 4K IMEM buffer
					 */
};

struct tzbsp_diag_t {
	uint32_t unused[7];	/* Unused variable is to support the
				 * corresponding structure in trustzone
				 */
	uint32_t ring_off;
	uint32_t unused1[514];
	struct tzbsp_diag_log_t log;
};

/* Below structure to support AARCH64 TZ */
struct tzbsp_diag_t_v8 {
	uint32_t unused[7];	/* Unused variable is to support the
				 * corresponding structure in trustzone
				 * and size is varying based on AARCH64 TZ
				 */
	uint32_t ring_off;
	uint32_t unused1[411];
	struct tzbsp_diag_log_t log;
};

struct log_read {
	uint32_t log_buf;
	uint32_t buf_size;
};

extern int qcom_qfprom_write_version(void *wrip, int size);
int qcom_qfprom_read_version(uint32_t sw_type, uint32_t value,
				uint32_t qfprom_ret_ptr);
extern int qcom_qfprom_show_authenticate(char *buf);
extern int qcom_scm_set_cold_boot_addr(void *entry, const cpumask_t *cpus);
extern int qcom_scm_set_warm_boot_addr(void *entry, const cpumask_t *cpus);

#define SCM_SVC_INFO                   0x6
#define SCM_GSBI_ADM_MUX_SEL_CMD       0x5
extern int qcom_scm_tcsr(u32 svc_id, u32 cmd_id,
			struct qcom_scm_tcsr_req *tcsr_cmd);

#define QCOM_SCM_HDCP_MAX_REQ_CNT	5

extern bool qcom_scm_is_available(void);

extern bool qcom_scm_hdcp_available(void);

extern bool qcom_scm_pas_supported(u32 peripheral);
extern int qcom_scm_pas_init_image(u32 peripheral, const void *metadata,
		size_t size);
extern int qcom_scm_pas_mem_setup(u32 peripheral, phys_addr_t addr,
		phys_addr_t size);
extern int qcom_scm_pas_auth_and_reset(u32 peripheral);
extern int qcom_scm_pas_shutdown(u32 peripheral);

#define SCM_SVC_UTIL		0x3
#define SCM_CMD_SET_REGSAVE 	0x2

extern int qcom_scm_regsave(u32 svc_id, u32 cmd_id, void *,
						unsigned int size);

#define TZ_INFO_GET_DIAG_ID	0x2
#define SCM_SVC_INFO		0x6

extern int qcom_scm_tz_log(u32 svc_id, u32 cmd_id, void *ker_buf, u32 *buf_len,
				u32 **ring_off, struct tzbsp_diag_log_t **log);

#define QCOM_SCM_CPU_PWR_DOWN_L2_ON	0x0
#define QCOM_SCM_CPU_PWR_DOWN_L2_OFF	0x1

extern void qcom_scm_cpu_power_down(u32 flags);

#define QCOM_SCM_VERSION(major, minor) (((major) << 16) | ((minor) & 0xFF))

extern u32 qcom_scm_get_version(void);

extern s32 qcom_scm_pinmux_read(u32 arg1);
extern s32 qcom_scm_pinmux_write(u32 arg1, u32 arg2);

extern int qcom_scm_cache_dump(u32 cpu);
extern int qcom_scm_get_cache_dump_size(u32 cmd_id, void *cmd_buf, u32 size);
extern int qcom_scm_send_cache_dump_addr(u32 cmd_id, void *cmd_buf, u32 size);
extern int qcom_scm_tzsched(const void *req, size_t req_size,
				void *resp, size_t resp_size);

#define QCOM_SCM_SVC_FUSE		0x8

extern int qcom_los_scm_call(struct device *, u32 svc_id, u32 cmd_id,
		void *cmd_buf, size_t size);

#endif

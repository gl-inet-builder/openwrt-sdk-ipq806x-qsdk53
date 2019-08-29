/**
	\file openobex/obex_const.h
	OpenOBEX library - Free implementation of the Object Exchange protocol.

	Copyright (C) 1999-2000  Dag Brattli <dagb@cs.uit.no>
	Copyright (C) 1999-2000  Pontus Fuchs <pontus.fuchs@tactel.se>
	Copyright (C) 2001-2002  Jean Tourrilhes <jt@hpl.hp.com>
	Copyright (C) 2002-2006  Marcel Holtmann <marcel@holtmann.org>
	Copyright (C) 2002-2008  Christian W. Zuckschwerdt <zany@triq.net>
	Copyright (C) 2002  Dmitry Kasatkin <dmitry.kasatkin@nokia.com>
	Copyright (C) 2005  Herton Ronaldo Krzesinski <herton@conectiva.com.br>
	Copyright (C) 2005-2008  Alex Kanavin <ak@sensi.org>
	Copyright (C) 2006  Johan Hedberg <johan.hedberg@nokia.com>
	Copyright (C) 2007-2012  Hendrik Sattler <post@hendrik-sattler.de>

	OpenOBEX is free software; you can redistribute it and/or modify
	it under the terms of the GNU Lesser General Public License as
	published by the Free Software Foundation; either version 2.1 of
	the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public
	License along with OpenOBEX. If not, see <http://www.gnu.org/>.
 */

#ifndef __OBEX_CONST_H
#define __OBEX_CONST_H

#ifdef __cplusplus
extern "C" {
#endif

#include <inttypes.h>
#include <openobex/version.h>

/** OBEX object tag information
 */
typedef union {
	/** use this when header type is #OBEX_HDR_TYPE_UINT32 */
	uint32_t bq4;
	/** use this when header type is #OBEX_HDR_TYPE_UINT8 */
	uint8_t bq1;
	/** use this when header type is #OBEX_HDR_TYPE_BYTES
	 * or #OBEX_HDR_TYPE_UNICODE
	 */
	const uint8_t *bs;
} obex_headerdata_t;

/** Function definition for custom transports
 */
typedef struct {
	/** connect to a server (client-only) */
	int (*connect)(obex_t *handle, void *customdata);
	/** disconnect (server/client) */
	int (*disconnect)(obex_t *handle, void *customdata);
	/** listen to incoming connections (server-only) */
	int (*listen)(obex_t *handle, void *customdata);
	/** remote connection input
	 * This function is optional as it is an alternative to providing the
	 * data with #OBEX_CustomDataFeed(). The memory that 'buf' points to has
	 * enough room for RX MTU bytes. The minimum number of bytes needed to
	 * go on is specified by 'size'.*/
	int (*read)(obex_t *handle, void *customdata, uint8_t *buf, int size);
	/** remote connection output */
	int (*write)(obex_t *handle, void *customdata, uint8_t *buf, int len);
	/** directly called by #OBEX_HandleInput */
	int (*handleinput)(obex_t *handle, void *customdata, int timeout);
	void *customdata;
} obex_ctrans_t;

/** USB-specific OBEX service information
 * provided by optional Service Identification Functional Descriptor
 * (CDC WMC specification section 6.5.2.5)
 */
typedef struct {
	/** Role bit mask: bit 0 is set if client, unset if server */
	uint8_t role;
	/** Service UUID */
	uint8_t uuid[16];
	/** Service version */
	uint16_t version;
	/** Set if the service provides/expects
	 *  an OBEX Default Server (spec section 6.5.2.5.2) */
	int is_default_uuid;
} obex_usb_intf_service_t;

/** USB-specific OBEX interface information */
typedef struct {
	/** Manufacturer, e.g. Nokia */
	char *manufacturer;
	/** Product, e.g. Nokia 6680 */
	char *product;
	/** Product serial number */
	char *serial;
	/** USB device configuration description */
	char *configuration;
	/** Control interface description */
	char *control_interface;
	/** Idle data interface description, typically empty */
	char *data_interface_idle;
	/** Active data interface description, typically empty */
	char *data_interface_active;
	/** Service information descriptor, may be NULL if absent */
	obex_usb_intf_service_t *service;
	/** USB-IF vendor ID */
	unsigned int idVendor;
	/** USB-IF product ID */
	unsigned int idProduct;
	/** Bus number that a USB device is connected to */
	unsigned int bus_number;
	/** Device address on the bus */
	unsigned int device_address;
	/** USB device interface number */
	unsigned int interface_number;
	/** Internal information for the transport layer in the library */
	struct obex_usb_intf_transport_t *intf;
} obex_usb_intf_t;

/** IrDA-specific OBEX interface information */
typedef struct {
	/** Address of local interface */
	uint32_t local;
	/** Address of remote device */
	uint32_t remote;
	/** Description */
	char *info;
	/** Charset used for description */
	uint8_t	charset;
	/** Hint bits */
	uint8_t	hints[2];

	/** service selector, filled by application, "OBEX" if NULL */
	const char *service;
} obex_irda_intf_t;

/** Generic OBEX interface information */
typedef union {
	/** IrDA-specific OBEX interface information */
	obex_irda_intf_t irda;
	/** USB-specific OBEX interface information */
	obex_usb_intf_t usb;
} obex_interface_t;

/** Possible modes */
enum obex_mode {
	OBEX_MODE_CLIENT = 0, /**< client mode */
	OBEX_MODE_SERVER = 1, /**< server mode */
};

/** Possible data direction */
enum obex_data_direction {
	OBEX_DATA_NONE = 0,
	OBEX_DATA_IN = 1,
	OBEX_DATA_OUT = 2,
};

/** Possible events */
enum obex_event {
	/** Progress has been made */
	OBEX_EV_PROGRESS = 0,
	/** An incoming request is about to come */
	OBEX_EV_REQHINT = 1,
	/** An incoming request has arrived */
	OBEX_EV_REQ = 2,
	/** Request has finished */
	OBEX_EV_REQDONE = 3,
	/** Link has been disconnected */
	OBEX_EV_LINKERR = 4,
	/** Malformed data encountered */
	OBEX_EV_PARSEERR = 5,
	/** Connection accepted */
	OBEX_EV_ACCEPTHINT = 6,
	/** Request was aborted */
	OBEX_EV_ABORT = 7,
	/** Need to feed more data when sending a stream */
	OBEX_EV_STREAMEMPTY = 8,
	/** Time to pick up data when receiving a stream */
	OBEX_EV_STREAMAVAIL = 9,
	/** Unexpected data, not fatal */
	OBEX_EV_UNEXPECTED = 10,
	/** First packet of an incoming request has been parsed */
	OBEX_EV_REQCHECK = 11,
};

/* For OBEX_Init() */
#define OBEX_FL_KEEPSERVER      (1 <<  1) /**< Keep the server alive */
#define OBEX_FL_FILTERHINT      (1 <<  2) /**< Filter devices based on hint bit */
#define OBEX_FL_FILTERIAS       (1 <<  3) /**< Filter devices based on IAS entry */
#define OBEX_FL_CLOEXEC         (1 <<  4) /**< Set CLOEXEC flag on file descriptors */
#define OBEX_FL_NONBLOCK        (1 <<  5) /**< Set the NONBLOCK flag on file descriptors */ 

/* For OBEX_ObjectAddHeader */
#define OBEX_FL_FIT_ONE_PACKET  (1 <<  0) /**< This header must fit in one packet */
#define OBEX_FL_STREAM_START    (1 <<  1) /**< Start of streaming body */
#define OBEX_FL_STREAM_DATA     (1 <<  2) /**< Set data for body stream */
#define OBEX_FL_STREAM_DATAEND  (1 <<  3) /**< Set data (or no data) for body stream and finish it */
#define OBEX_FL_SUSPEND         (1 <<  4) /**< Suspend after sending this header */
#define OBEX_FL_STREAM_CONTINUE (1 <<  5) /**< Continue body stream after all remaining headers */

/** Possible transports */
enum obex_transport_type {
	OBEX_TRANS_IRDA = 1,      /**< Infrared */
	OBEX_TRANS_INET = 2,      /**< TCP over IPv4/v6 */
	OBEX_TRANS_CUSTOM = 3,    /**< Custom transport with callbacks */
	OBEX_TRANS_BLUETOOTH = 4, /**< Bluetooth RFCOMM */
	OBEX_TRANS_FD = 5,        /**< file descriptors */
	OBEX_TRANS_USB = 6,       /**< USB CDC OBEX */
};

/* Standard headers */
#define OBEX_HDR_TYPE_SHIFT	6
#define OBEX_HDR_TYPE_MASK	0xc0
#define OBEX_HDR_ID_MASK	0x3f

/** Type part of an obex header value */
enum obex_hdr_type {
	/** used as invalid return value */
	OBEX_HDR_TYPE_INVALID = -1,
	/** zero terminated unicode string (network byte order) */
	OBEX_HDR_TYPE_UNICODE = (0 << OBEX_HDR_TYPE_SHIFT),
	/** byte array */
	OBEX_HDR_TYPE_BYTES   = (1 << OBEX_HDR_TYPE_SHIFT),
	/** 8bit unsigned integer */
	OBEX_HDR_TYPE_UINT8   = (2 << OBEX_HDR_TYPE_SHIFT),
	/** 32bit unsigned integer */
	OBEX_HDR_TYPE_UINT32  = (3 << OBEX_HDR_TYPE_SHIFT),
};

/** Identifier part of an obex header value */
enum obex_hdr_id {
	/** used as invalid return value */
	OBEX_HDR_ID_INVALID    = -1,
	/** Number of objects (used by connect) */
	OBEX_HDR_ID_COUNT        = 0,
	/** Name of the object */
	OBEX_HDR_ID_NAME         = 1,
	/** Type of the object */
	OBEX_HDR_ID_TYPE         = 2,
	/** Total length of object */
	OBEX_HDR_ID_LENGTH       = 3,
	/** Last modification time of (ISO8601) */
	OBEX_HDR_ID_TIME         = 4,
	/** Description of object */
	OBEX_HDR_ID_DESCRIPTION  = 5,
	/** Identifies the target for the object */
	OBEX_HDR_ID_TARGET       = 6,
	/** An HTTP 1.x header */
	OBEX_HDR_ID_HTTP         = 7,
	/** Data part of the object */
	OBEX_HDR_ID_BODY         = 8,
	/** Last data part of the object */
	OBEX_HDR_ID_BODY_END     = 9,
	/** Identifies the sender of the object */
	OBEX_HDR_ID_WHO          = 10,
	/** Connection identifier */
	OBEX_HDR_ID_CONNECTION   = 11,
	/** Application parameters */
	OBEX_HDR_ID_APPARAM      = 12,
	/** Authentication challenge */
	OBEX_HDR_ID_AUTHCHAL     = 13,
	/** Authentication response */
	OBEX_HDR_ID_AUTHRESP     = 14,
	/** indicates the creator of an object */
	OBEX_HDR_ID_CREATOR      = 15,
	/** uniquely identifies the network client (OBEX server) */
	OBEX_HDR_ID_WANUUID      = 16,
	/** OBEX Object class of object */
	OBEX_HDR_ID_OBJECTCLASS  = 17,
	/** Parameters used in session commands/responses */
	OBEX_HDR_ID_SESSIONPARAM = 18,
	/** Sequence number used in each OBEX packet for reliability */
	OBEX_HDR_ID_SESSIONSEQ   = 19,
	/** Specifies the action for the ACTION command */
	OBEX_HDR_ID_ACTION_ID    = 20,
	/** Destination object name */
	OBEX_HDR_ID_DESTNAME     = 21,
	/** bit mask for setting permissions */
	OBEX_HDR_ID_PERMISSIONS  = 22,
	/** response mode selection */
	OBEX_HDR_ID_SRM          = 23,
	/** flags for single response mode */
	OBEX_HDR_ID_SRM_FLAGS    = 24,
};

#define OBEX_HDR_EMPTY		0x00	/* Empty header (buggy OBEX servers) */
#define OBEX_HDR_COUNT		(OBEX_HDR_ID_COUNT        | OBEX_HDR_TYPE_UINT32 )
#define OBEX_HDR_NAME		(OBEX_HDR_ID_NAME         | OBEX_HDR_TYPE_UNICODE)
#define OBEX_HDR_TYPE		(OBEX_HDR_ID_TYPE         | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_LENGTH		(OBEX_HDR_ID_LENGTH       | OBEX_HDR_TYPE_UINT32 )
#define OBEX_HDR_TIME		(OBEX_HDR_ID_TIME         | OBEX_HDR_TYPE_BYTES  ) /* Format: ISO 8601 */
#define OBEX_HDR_TIME2		(OBEX_HDR_ID_TIME         | OBEX_HDR_TYPE_UINT32 ) /* Deprecated use HDR_TIME instead */
#define OBEX_HDR_DESCRIPTION	(OBEX_HDR_ID_DESCRIPTION  | OBEX_HDR_TYPE_UNICODE)
#define OBEX_HDR_TARGET		(OBEX_HDR_ID_TARGET       | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_HTTP		(OBEX_HDR_ID_HTTP         | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_BODY		(OBEX_HDR_ID_BODY         | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_BODY_END	(OBEX_HDR_ID_BODY_END     | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_WHO		(OBEX_HDR_ID_WHO          | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_CONNECTION	(OBEX_HDR_ID_CONNECTION   | OBEX_HDR_TYPE_UINT32 )
#define OBEX_HDR_APPARAM	(OBEX_HDR_ID_APPARAM      | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_AUTHCHAL	(OBEX_HDR_ID_AUTHCHAL     | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_AUTHRESP	(OBEX_HDR_ID_AUTHRESP     | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_CREATOR	(OBEX_HDR_ID_CREATOR      | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_WANUUID	(OBEX_HDR_ID_WANUUID      | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_OBJECTCLASS	(OBEX_HDR_ID_OBJECTCLASS  | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_SESSIONPARAM	(OBEX_HDR_ID_SESSIONPARAM | OBEX_HDR_TYPE_BYTES  )
#define OBEX_HDR_SESSIONSEQ	(OBEX_HDR_ID_SESSIONSEQ   | OBEX_HDR_TYPE_UINT8  )
#define OBEX_HDR_ACTION_ID	(OBEX_HDR_ID_ACTION_ID    | OBEX_HDR_TYPE_UINT8  )
#define OBEX_HDR_DESTNAME	(OBEX_HDR_ID_DESTNAME     | OBEX_HDR_TYPE_UNICODE)
#define OBEX_HDR_PERMISSIONS	(OBEX_HDR_ID_PERMISSIONS  | OBEX_HDR_TYPE_UINT32 )
#define OBEX_HDR_SRM            (OBEX_HDR_ID_SRM          | OBEX_HDR_TYPE_UINT8  )
#define OBEX_HDR_SRM_FLAGS      (OBEX_HDR_ID_SRM_FLAGS    | OBEX_HDR_TYPE_UINT8  )

/** Obex commands */
enum obex_cmd {
	OBEX_CMD_CONNECT	= 0x00,
	OBEX_CMD_DISCONNECT	= 0x01,
	OBEX_CMD_PUT		= 0x02,
	OBEX_CMD_GET		= 0x03,
	OBEX_CMD_SETPATH	= 0x05,
	OBEX_CMD_ACTION		= 0x06,
	OBEX_CMD_SESSION	= 0x07, /**< used for reliable session support */
	OBEX_CMD_ABORT		= 0x7f,
};
#define OBEX_FINAL		0x80

/** Obex responses */
enum obex_rsp {
	OBEX_RSP_CONTINUE		= 0x10,
	OBEX_RSP_SWITCH_PRO		= 0x11,
	OBEX_RSP_SUCCESS		= 0x20,
	OBEX_RSP_CREATED		= 0x21,
	OBEX_RSP_ACCEPTED		= 0x22,
	OBEX_RSP_NON_AUTHORITATIVE	= 0x23,
	OBEX_RSP_NO_CONTENT		= 0x24,
	OBEX_RSP_RESET_CONTENT		= 0x25,
	OBEX_RSP_PARTIAL_CONTENT	= 0x26,
	OBEX_RSP_MULTIPLE_CHOICES	= 0x30,
	OBEX_RSP_MOVED_PERMANENTLY	= 0x31,
	OBEX_RSP_MOVED_TEMPORARILY	= 0x32,
	OBEX_RSP_SEE_OTHER		= 0x33,
	OBEX_RSP_NOT_MODIFIED		= 0x34,
	OBEX_RSP_USE_PROXY		= 0x35,
	OBEX_RSP_BAD_REQUEST		= 0x40,
	OBEX_RSP_UNAUTHORIZED		= 0x41,
	OBEX_RSP_PAYMENT_REQUIRED	= 0x42,
	OBEX_RSP_FORBIDDEN		= 0x43,
	OBEX_RSP_NOT_FOUND		= 0x44,
	OBEX_RSP_METHOD_NOT_ALLOWED	= 0x45,
	OBEX_RSP_NOT_ACCEPTABLE		= 0x46,
	OBEX_RSP_PROXY_AUTH_REQUIRED	= 0x47,
	OBEX_RSP_REQUEST_TIME_OUT	= 0x48,
	OBEX_RSP_CONFLICT		= 0x49,
	OBEX_RSP_GONE			= 0x4a,
	OBEX_RSP_LENGTH_REQUIRED	= 0x4b,
	OBEX_RSP_PRECONDITION_FAILED	= 0x4c,
	OBEX_RSP_REQ_ENTITY_TOO_LARGE	= 0x4d,
	OBEX_RSP_REQ_URL_TOO_LARGE	= 0x4e,
	OBEX_RSP_UNSUPPORTED_MEDIA_TYPE	= 0x4f,
	OBEX_RSP_INTERNAL_SERVER_ERROR	= 0x50,
	OBEX_RSP_NOT_IMPLEMENTED	= 0x51,
	OBEX_RSP_BAD_GATEWAY		= 0x52,
	OBEX_RSP_SERVICE_UNAVAILABLE	= 0x53,
	OBEX_RSP_GATEWAY_TIMEOUT	= 0x54,
	OBEX_RSP_VERSION_NOT_SUPPORTED	= 0x55,
	OBEX_RSP_DATABASE_FULL		= 0x60,
	OBEX_RSP_DATABASE_LOCKED	= 0x61,
};

/** Obex response modes */
enum obex_rsp_mode {
	OBEX_RSP_MODE_NORMAL = 0, /**< normal response mode */
	OBEX_RSP_MODE_SINGLE = 1, /**< single response mode (SRM) */
};

/* Min, Max and default transport MTU */
#define OBEX_DEFAULT_MTU	1024
#define OBEX_MINIMUM_MTU	255
#define OBEX_MAXIMUM_MTU	65535

/** Optimum MTU for various transport (optimum for throughput).
 * The user/application has to set them via OBEX_SetTransportMTU().
 * If you are worried about safety or latency, stick with the current
 * default... - Jean II */
#define OBEX_IRDA_OPT_MTU	(7 * 2039)	/* 7 IrLAP frames */

#ifdef __cplusplus
}
#endif

#endif /* __OBEX_CONST_H */

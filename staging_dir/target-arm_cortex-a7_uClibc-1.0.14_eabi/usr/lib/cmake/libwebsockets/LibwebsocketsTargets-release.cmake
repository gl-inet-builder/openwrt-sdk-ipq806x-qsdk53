#----------------------------------------------------------------
# Generated CMake target import file for configuration "Release".
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "websockets" for configuration "Release"
set_property(TARGET websockets APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(websockets PROPERTIES
  IMPORTED_LINK_INTERFACE_LANGUAGES_RELEASE "C"
  IMPORTED_LINK_INTERFACE_LIBRARIES_RELEASE "/home/lancer/workspace/gl-image/qsdk53/staging_dir/target-arm_cortex-a7_uClibc-1.0.14_eabi/usr/lib/libz.so;/home/lancer/workspace/gl-image/qsdk53/staging_dir/target-arm_cortex-a7_uClibc-1.0.14_eabi/usr/lib/libssl.so;/home/lancer/workspace/gl-image/qsdk53/staging_dir/target-arm_cortex-a7_uClibc-1.0.14_eabi/usr/lib/libcrypto.so;dl;m"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/lib/libwebsockets.a"
  )

list(APPEND _IMPORT_CHECK_TARGETS websockets )
list(APPEND _IMPORT_CHECK_FILES_FOR_websockets "${_IMPORT_PREFIX}/lib/libwebsockets.a" )

# Import target "websockets_shared" for configuration "Release"
set_property(TARGET websockets_shared APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(websockets_shared PROPERTIES
  IMPORTED_LINK_INTERFACE_LIBRARIES_RELEASE "/home/lancer/workspace/gl-image/qsdk53/staging_dir/target-arm_cortex-a7_uClibc-1.0.14_eabi/usr/lib/libz.so;/home/lancer/workspace/gl-image/qsdk53/staging_dir/target-arm_cortex-a7_uClibc-1.0.14_eabi/usr/lib/libssl.so;/home/lancer/workspace/gl-image/qsdk53/staging_dir/target-arm_cortex-a7_uClibc-1.0.14_eabi/usr/lib/libcrypto.so;dl;m"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/lib/libwebsockets.so.4.0.0"
  IMPORTED_SONAME_RELEASE "libwebsockets.so.4.0.0"
  )

list(APPEND _IMPORT_CHECK_TARGETS websockets_shared )
list(APPEND _IMPORT_CHECK_FILES_FOR_websockets_shared "${_IMPORT_PREFIX}/lib/libwebsockets.so.4.0.0" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)

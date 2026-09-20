// https://github.com/ghenry22/capacitor-plugins/blob/main/filesystem/
package app.hayase;

import android.Manifest;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import app.hayase.exceptions.DirectoryNotFoundException;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.attribute.BasicFileAttributes;
import org.json.JSONException;

@CapacitorPlugin(name = "Filesystem", permissions = {
        @Permission(strings = { Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "publicStorage")
})
public class FilesystemPlugin extends Plugin {

    static final String PUBLIC_STORAGE = "publicStorage";
    private Filesystem implementation;

    @Override
    public void load() {
        implementation = new Filesystem(getContext());
    }

    private static final String PERMISSION_DENIED_ERROR = "Unable to do file operation, user denied permission request";

    @PluginMethod
    public void isPortableStorageAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", implementation.isPortableStorageAvailable());
        call.resolve(ret);
    }

    @PluginMethod
    public void readdir(PluginCall call) {
        String path = call.getString("path");
        String directory = getDirectoryParameter(call);

        if (isPublicDirectory(directory) && !isStoragePermissionGranted()) {
            requestAllPermissions(call, "permissionCallback");
        } else {
            try {
                File[] files = implementation.readdir(path, directory);
                JSArray filesArray = new JSArray();
                if (files != null) {
                    for (var i = 0; i < files.length; i++) {
                        File fileObject = files[i];
                        JSObject data = new JSObject();
                        data.put("name", fileObject.getName());
                        data.put("type", fileObject.isDirectory() ? "directory" : "file");
                        data.put("size", fileObject.length());
                        data.put("mtime", fileObject.lastModified());
                        data.put("uri", Uri.fromFile(fileObject).toString());

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            try {
                                BasicFileAttributes attr = Files.readAttributes(fileObject.toPath(),
                                        BasicFileAttributes.class);

                                // use whichever is the oldest between creationTime and lastAccessTime
                                if (attr.creationTime().toMillis() < attr.lastAccessTime().toMillis()) {
                                    data.put("ctime", attr.creationTime().toMillis());
                                } else {
                                    data.put("ctime", attr.lastAccessTime().toMillis());
                                }
                            } catch (Exception ex) {
                            }
                        } else {
                            data.put("ctime", null);
                        }
                        filesArray.put(data);
                    }

                    JSObject ret = new JSObject();
                    ret.put("files", filesArray);
                    call.resolve(ret);
                } else {
                    call.reject("Unable to read directory");
                }
            } catch (DirectoryNotFoundException ex) {
                call.reject(ex.getMessage());
            }
        }
    }

    @PluginMethod
    public void stat(PluginCall call) {
        String path = call.getString("path");
        String directory = getDirectoryParameter(call);

        File fileObject = implementation.getFileObject(path, directory);

        if (isPublicDirectory(directory) && !isStoragePermissionGranted()) {
            requestAllPermissions(call, "permissionCallback");
        } else {
            if (!fileObject.exists()) {
                call.reject("File does not exist");
                return;
            }

            JSObject data = new JSObject();
            data.put("type", fileObject.isDirectory() ? "directory" : "file");
            data.put("size", fileObject.length());
            data.put("mtime", fileObject.lastModified());
            data.put("uri", Uri.fromFile(fileObject).toString());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                try {
                    BasicFileAttributes attr = Files.readAttributes(fileObject.toPath(), BasicFileAttributes.class);

                    // use whichever is the oldest between creationTime and lastAccessTime
                    if (attr.creationTime().toMillis() < attr.lastAccessTime().toMillis()) {
                        data.put("ctime", attr.creationTime().toMillis());
                    } else {
                        data.put("ctime", attr.lastAccessTime().toMillis());
                    }
                } catch (Exception ex) {
                }
            } else {
                data.put("ctime", null);
            }

            call.resolve(data);
        }
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject permissionsResultJSON = new JSObject();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // For Android 11+, check MANAGE_EXTERNAL_STORAGE permission
            permissionsResultJSON.put(PUBLIC_STORAGE, Environment.isExternalStorageManager() ? "granted" : "denied");
            permissionsResultJSON.put("manageExternalStorage",
                    Environment.isExternalStorageManager() ? "granted" : "denied");
        } else {
            // For older versions, check traditional storage permissions
            if (isStoragePermissionGranted()) {
                permissionsResultJSON.put(PUBLIC_STORAGE, "granted");
            } else {
                super.checkPermissions(call);
                return;
            }
        }
        call.resolve(permissionsResultJSON);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (isStoragePermissionGranted()) {
            JSObject permissionsResultJSON = new JSObject();
            permissionsResultJSON.put(PUBLIC_STORAGE, "granted");
            call.resolve(permissionsResultJSON);
        } else {
            requestPermissionForAlias(PUBLIC_STORAGE, call, "permissionCallback");
        }
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        if (!isStoragePermissionGranted()) {
            Logger.debug(getLogTag(), "User denied storage permission");
            call.reject(PERMISSION_DENIED_ERROR);
            return;
        }

        switch (call.getMethodName()) {
            case "readdir":
                readdir(call);
                break;
            case "stat":
                stat(call);
                break;
        }
    }

    /**
     * Checks the the given permission is granted or not
     * 
     * @return Returns true if the app is running on Android 30 or newer or if the
     *         permission is already granted
     *         or false if it is denied.
     */
    private boolean isStoragePermissionGranted() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                || getPermissionState(PUBLIC_STORAGE) == PermissionState.GRANTED;
    }

    /**
     * Reads the directory parameter from the plugin call
     * 
     * @param call the plugin call
     */
    private String getDirectoryParameter(PluginCall call) {
        return call.getString("directory");
    }

    /**
     * True if the given directory string is a public storage directory, which is
     * accessible by the user or other apps.
     * 
     * @param directory the directory string.
     */
    private boolean isPublicDirectory(String directory) {
        return "DOCUMENTS".equals(directory) || "EXTERNAL_STORAGE".equals(directory);
    }
}
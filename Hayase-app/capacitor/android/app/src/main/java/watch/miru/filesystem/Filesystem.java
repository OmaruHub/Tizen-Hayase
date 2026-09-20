// https://github.com/ghenry22/capacitor-plugins/blob/main/filesystem/
package app.hayase;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.util.Base64;
import androidx.core.os.EnvironmentCompat;
import app.hayase.exceptions.DirectoryNotFoundException;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.plugin.util.CapacitorHttpUrlConnection;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.json.JSONException;

public class Filesystem {

    private Context context;

    Filesystem(Context context) {
        this.context = context;
    }

    public File[] readdir(String path, String directory) throws DirectoryNotFoundException {
        File[] files = null;
        File fileObject = getFileObject(path, directory);
        if (fileObject != null && fileObject.exists()) {
            files = fileObject.listFiles();
        } else {
            throw new DirectoryNotFoundException("Directory does not exist");
        }
        return files;
    }

    @SuppressWarnings("deprecation")
    public File getDirectory(String directory) {
        Context c = this.context;
        switch (directory) {
            case "DOCUMENTS":
                return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
            case "DATA":
            case "LIBRARY":
                return c.getFilesDir();
            case "CACHE":
                return c.getCacheDir();
            case "EXTERNAL":
                return c.getExternalFilesDir(null);
            case "EXTERNAL_STORAGE":
                return Environment.getExternalStorageDirectory();
            case "PORTABLE_STORAGE":
                return this.getPortableStorage();
        }
        return null;
    }

    public boolean isPortableStorageAvailable() {
        String[] storageDirectories = getFilteredStorageDirectories();
        return storageDirectories.length > 0;
    }

    private File getPortableStorage() {
        String[] storageDirectories = getFilteredStorageDirectories();

        if (storageDirectories.length == 0) {
            return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
        } else {
            return new File(storageDirectories[0]);
        }
    }

    private String[] getFilteredStorageDirectories() {
        List<String> results = new ArrayList<String>();

        Context c = this.context;

        File[] externalDirs = c.getExternalFilesDirs(null);

        // Get a list of external file systems and filter for removable storage only
        for (File file : externalDirs) {
            if (file == null) {
                continue;
            }
            String applicationPath = file.getPath();

            boolean addPath = false;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                addPath = Environment.isExternalStorageRemovable(file);
            } else {
                addPath = Environment.MEDIA_MOUNTED.equals(EnvironmentCompat.getStorageState(file));
            }

            if (addPath) {
                results.add(applicationPath);
            }
        }

        // Remove paths which may not be external SDCard, like OTG
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            for (int i = 0; i < results.size(); i++) {
                if (!results.get(i).toLowerCase().matches(".*[0-9a-f]{4}[-][0-9a-f]{4}.*")) {
                    results.remove(i--);
                }
            }
        } else {
            for (int i = 0; i < results.size(); i++) {
                if (!results.get(i).toLowerCase().contains("ext") && !results.get(i).toLowerCase().contains("sdcard")) {
                    results.remove(i--);
                }
            }
        }

        String[] storageDirectories = new String[results.size()];
        for (int i = 0; i < results.size(); ++i)
            storageDirectories[i] = results.get(i);

        return storageDirectories;
    }

    public File getFileObject(String path, String directory) {
        if (directory == null) {
            Uri u = Uri.parse(path);
            if (u.getScheme() == null || u.getScheme().equals("file")) {
                return new File(u.getPath());
            }
        }

        File androidDirectory = this.getDirectory(directory);

        if (androidDirectory == null) {
            return null;
        } else {
            if (!androidDirectory.exists()) {
                androidDirectory.mkdir();
            }
        }

        return new File(androidDirectory, path);
    }

}
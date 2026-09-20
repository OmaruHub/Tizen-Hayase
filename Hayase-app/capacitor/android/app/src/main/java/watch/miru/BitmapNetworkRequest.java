package app.hayase;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import androidx.annotation.Nullable;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.toolbox.HttpHeaderParser;

public class BitmapNetworkRequest extends Request<Bitmap> {
  private final Response.Listener<Bitmap> listener;

  public BitmapNetworkRequest(int method, String url, Response.Listener<Bitmap> listener,
      @Nullable Response.ErrorListener errorListener) {
    super(method, url, errorListener);
    this.listener = listener;
  }

  @Override
  protected Response<Bitmap> parseNetworkResponse(NetworkResponse response) {
    Bitmap res = BitmapFactory.decodeByteArray(response.data, 0, response.data.length);
    return Response.success(res, HttpHeaderParser.parseCacheHeaders(response));
  }

  @Override
  protected void deliverResponse(Bitmap response) {
    listener.onResponse(response);
  }
}

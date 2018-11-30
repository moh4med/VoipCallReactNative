package com.voipexample;

import android.content.Context;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.os.Vibrator;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RingToneModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext mContext;
    private Ringtone ringtone;

    public RingToneModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext=reactContext;
    }

    @Override
    public String getName() {
        return "RingToneModule";
    }

    @ReactMethod
    public void PlaySound() {
        Log.d("TAG","PlaySound");
        Vibrator v = (Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
        v.vibrate(1000);
        ringtone = RingtoneManager.getRingtone(mContext,
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE));
        if (ringtone != null) {
            ringtone.play();
        }
    }
    @ReactMethod
    public void StopSound(){
        Log.d("TAG","StopSound");
        ringtone.stop();
    }
}

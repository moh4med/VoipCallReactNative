package com.voipexample;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.os.Bundle;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startActivity(new Intent(this,NewCallActivity.class));
    }
    @Override
    protected String getMainComponentName() {
        return "VoipExample";
    }
}

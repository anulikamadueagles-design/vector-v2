package com.vectors.elementtech;

import android.app.*;
import android.os.*;
import android.graphics.Color;
import android.content.*;
import android.net.Uri;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.net.*;
import java.util.*;

public class MainActivity extends Activity {

    static final String BASE = "https://vector-v2.onrender.com";
    String token = "";
    LinearLayout root;
    TextView output;
    EditText input;

    int BG = Color.rgb(5,9,20);
    int PANEL = Color.rgb(10,16,32);
    int CYAN = Color.rgb(54,217,255);
    int WHITE = Color.rgb(244,247,255);
    int MUTED = Color.rgb(137,150,173);

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);

        token = getPreferences(0).getString("token","");
        showMain();
    }

    TextView tv(String text, int size) {
        TextView t = new TextView(this);
        t.setText(text);
        t.setTextColor(WHITE);
        t.setTextSize(size);
        t.setPadding(18,14,18,14);
        return t;
    }

    Button button(String text) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextColor(WHITE);
        b.setAllCaps(false);
        b.setBackgroundColor(PANEL);
        return b;
    }

    EditText edit(String hint) {
        EditText e = new EditText(this);
        e.setHint(hint);
        e.setHintTextColor(MUTED);
        e.setTextColor(WHITE);
        e.setSingleLine(false);
        e.setPadding(18,14,18,14);
        return e;
    }

    void baseScreen(String title) {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);

        TextView head = tv("VECTOR  •  " + title,20);
        head.setTextColor(CYAN);
        head.setPadding(20,24,20,20);
        root.addView(head);

        setContentView(root);
    }

    void showMain() {
        baseScreen("AI INTELLIGENCE PLATFORM");

        LinearLayout nav = new LinearLayout(this);
        nav.setOrientation(LinearLayout.VERTICAL);

        String[] names = {
            "Chat",
            "Image Generation",
            "Web Search",
            "Files",
            "Memory",
            "Projects",
            "Agents",
            "Assistants",
            "Education",
            "Video Generation"
        };

        for (String n : names) {
            Button b = button(n);
            nav.addView(b,new LinearLayout.LayoutParams(-1,58));

            b.setOnClickListener(v -> {
                switch(n) {
                    case "Chat": chat(); break;
                    case "Image Generation": image(); break;
                    case "Web Search": search(); break;
                    case "Files": files(); break;
                    case "Memory": memory(); break;
                    case "Projects": projects(); break;
                    case "Agents": agents(); break;
                    case "Assistants": assistants(); break;
                    case "Education": education(); break;
                    case "Video Generation": video(); break;
                }
            });
        }

        ScrollView sv = new ScrollView(this);
        sv.addView(nav);
        root.addView(sv,new LinearLayout.LayoutParams(-1,0,1));

        TextView footer = tv(
            "VECTOR\n" +
            "David Kamsi Elvis • Vector's Element Tech\n" +
            "Connected to VECTOR Cloud",
            11
        );
        footer.setTextColor(MUTED);
        root.addView(footer);
    }

    void workspace(String title, String hint, String endpoint) {
        baseScreen(title);

        input = edit(hint);
        root.addView(input,new LinearLayout.LayoutParams(-1,150));

        Button send = button("Run with VECTOR");
        root.addView(send);

        output = tv("",15);
        output.setTextIsSelectable(true);

        ScrollView sv = new ScrollView(this);
        sv.addView(output);
        root.addView(sv,new LinearLayout.LayoutParams(-1,0,1));

        Button back = button("← Back");
        root.addView(back);
        back.setOnClickListener(v -> showMain());

        send.setOnClickListener(v -> {
            String prompt = input.getText().toString().trim();
            if(prompt.isEmpty()) return;

            output.setText("VECTOR is working...");

            new Thread(() -> {
                try {
                    String result = post(endpoint,prompt);
                    runOnUiThread(() -> output.setText(result));
                } catch(Exception e) {
                    runOnUiThread(() ->
                        output.setText("VECTOR error: " + e.getMessage())
                    );
                }
            }).start();
        });
    }

    void chat() {
        workspace(
            "CHAT",
            "Ask VECTOR anything...",
            "/api/chat"
        );
    }

    void image() {
        workspace(
            "IMAGE GENERATION",
            "Describe the image you want...",
            "/api/images/generate"
        );
    }

    void search() {
        workspace(
            "WEB SEARCH",
            "What should VECTOR search for?",
            "/api/search"
        );
    }

    void files() {
        baseScreen("FILES");

        Button pick = button("Choose a file");
        root.addView(pick);

        output = tv(
            "Files are connected to the VECTOR backend.\n\n" +
            "Select a document to upload.",
            15
        );
        root.addView(output);

        pick.setOnClickListener(v -> {
            Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            i.setType("*/*");
            i.addCategory(Intent.CATEGORY_OPENABLE);
            startActivityForResult(i,900);
        });

        Button back = button("← Back");
        root.addView(back);
        back.setOnClickListener(v -> showMain());
    }

    @Override
    protected void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);

        if(requestCode==900 && resultCode==RESULT_OK && data!=null) {
            Uri uri=data.getData();
            output.setText(
                "Selected:\n" + uri + "\n\n" +
                "Upload endpoint: /api/files"
            );
        }
    }

    void memory() {
        workspace("MEMORY","Memory instruction or query...","/api/memory");
    }

    void projects() {
        workspace("PROJECTS","Project request...","/api/projects");
    }

    void agents() {
        workspace("AGENTS","Agent instruction...","/api/agents");
    }

    void assistants() {
        workspace("ASSISTANTS","Assistant instruction...","/api/assistants");
    }

    void education() {
        workspace(
            "EDUCATION",
            "Example: Explain inflation to a university student...",
            "/api/education"
        );
    }

    void video() {
        baseScreen("VIDEO GENERATION");

        TextView info = tv(
            "VECTOR VIDEO STUDIO\n\n" +
            "Text-to-video\n" +
            "Magic Hour / Pixazo backend\n" +
            "Automatic resolution compatibility\n" +
            "Provider fallback\n" +
            "Long-video planning\n\n" +
            "Enter your video prompt below.",
            14
        );
        root.addView(info);

        input=edit("Describe your video...");
        root.addView(input,new LinearLayout.LayoutParams(-1,150));

        Button generate=button("Generate Video");
        root.addView(generate);

        output=tv("",14);
        root.addView(output,new LinearLayout.LayoutParams(-1,0,1));

        Button back=button("← Back");
        root.addView(back);
        back.setOnClickListener(v -> showMain());

        generate.setOnClickListener(v -> {
            String p=input.getText().toString().trim();
            if(p.isEmpty()) return;

            output.setText(
                "Submitting video job...\n" +
                "VECTOR will automatically use compatible settings."
            );

            new Thread(() -> {
                try {
                    String r=post("/api/video/generate",p);
                    runOnUiThread(() -> output.setText(r));
                } catch(Exception e) {
                    runOnUiThread(() ->
                        output.setText("Video error: "+e.getMessage())
                    );
                }
            }).start();
        });
    }

    String post(String endpoint,String prompt) throws Exception {
        URL url=new URL(BASE+endpoint);
        HttpURLConnection c=(HttpURLConnection)url.openConnection();

        c.setRequestMethod("POST");
        c.setConnectTimeout(30000);
        c.setReadTimeout(120000);
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type","application/json");

        if(!token.isEmpty())
            c.setRequestProperty("Authorization","Bearer "+token);

        JSONObject body=new JSONObject();

        if(endpoint.equals("/api/chat")) {
            JSONArray messages=new JSONArray();
            JSONObject m=new JSONObject();
            m.put("role","user");
            m.put("content",prompt);
            messages.put(m);
            body.put("messages",messages);
        } else if(endpoint.equals("/api/images/generate")) {
            body.put("prompt",prompt);
        } else if(endpoint.equals("/api/search")) {
            body.put("query",prompt);
        } else if(endpoint.equals("/api/video/generate")) {
            body.put("prompt",prompt);
            body.put("provider","magichour");
            body.put("duration",10);
            body.put("aspect_ratio","16:9");
            body.put("resolution","auto");
        } else {
            body.put("prompt",prompt);
        }

        OutputStream os=c.getOutputStream();
        os.write(body.toString().getBytes("UTF-8"));
        os.close();

        int code=c.getResponseCode();

        InputStream is=code>=400
            ? c.getErrorStream()
            : c.getInputStream();

        if(is==null) is=c.getInputStream();

        BufferedReader br=new BufferedReader(
            new InputStreamReader(is)
        );

        StringBuilder sb=new StringBuilder();
        String line;

        while((line=br.readLine())!=null)
            sb.append(line).append('\n');

        br.close();

        return "HTTP "+code+"\n\n"+sb.toString();
    }
}

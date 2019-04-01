package com.dell.socialproject.config;

import com.dell.socialproject.domain.DeviceToken;
import com.dell.socialproject.repository.DeviceTokenRepository;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
public class FCMClient {

    Environment env;
    DeviceTokenRepository deviceTokenRepository;

    public FCMClient(Environment env,
                     DeviceTokenRepository deviceTokenRepository) {
        this.env = env;
        this.deviceTokenRepository = deviceTokenRepository;

        try {

            InputStream file = new ClassPathResource("path").getInputStream();

            FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(file))
                .setDatabaseUrl("url)
                .build();

            FirebaseApp.initializeApp(options);

        } catch (Exception e) {
            System.out.println(e.toString());
        }

    }

    public void sendNotification(MessageDTO message) {
        List<DeviceToken> deviceTokenList = this.deviceTokenRepository.findAllByUsuario(message.getTo());

        deviceTokenList.forEach(deviceToken -> {
            String tokenDevice = deviceToken.getToken();

            Message firebaseMessage = Message.builder()
                .putData("mensaje", message.getText())
                .putData("de", message.getFrom().getPrimerNombre() + " " + message.getFrom().getPrimerApellido())
                .setNotification(
                    new Notification(message.getFrom().getPrimerNombre() + " " + message.getFrom().getPrimerApellido(),
                        message.getText())
                ).setToken(tokenDevice)
                .build();

            try {
                String response = FirebaseMessaging.getInstance().sendAsync(firebaseMessage).get();
                System.out.println("Sent Message: " + response);
            } catch(Exception e) {
                System.out.println(e.toString());
            }
        });
    }
}

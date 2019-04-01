package com.dell.socialproject.config;

import com.dell.socialproject.domain.Chat;
import com.dell.socialproject.domain.Mensaje;
import com.dell.socialproject.domain.Usuario;

import java.time.LocalDateTime;

public class MessageDTO {
    private Usuario from;
    private String text;
    private String to;
    private LocalDateTime dateTime;
    private boolean connectingMessage;
    private boolean solicitudMessage;
    private boolean disconnectMessage;
    private boolean messageMessage;
    private Chat chat;

    private Mensaje mensaje;

    public MessageDTO(Usuario from,
                      String text,
                      String to,
                      LocalDateTime dateTime,
                      boolean connectingMessage,
                      boolean solicitudMessage,
                      boolean disconnectMessage,
                      boolean messageMessage,
                      Chat chat,
                      Mensaje mensaje
    ) {
        this.from = from;
        this.text = text;
        this.to = to;
        this.setDateTime(dateTime);
        this.setConnectingMessage(connectingMessage);
        this.setSolicitudMessage(solicitudMessage);
        this.setDisconnectMessage(disconnectMessage);
        this.setMessageMessage(messageMessage);
        this.chat = chat;
        this.mensaje = mensaje;
    }

    public boolean getConnectingMessage() {
        return this.isConnectingMessage();
    }

    public void setConnectingMessage(boolean connectingMessage) {
        this.connectingMessage = connectingMessage;
    }

    public String getTo() {
        return this.to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public Usuario getFrom() {
        return from;
    }

    public void setFrom(Usuario from) {
        this.from = from;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }


    @Override
    public String toString() {
        return "[{from: "+this.getFrom()+", text: "+this.getText()+", to: "+this.getTo()+", connectingMessage: "+this.getConnectingMessage()+"}]";
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public boolean isConnectingMessage() {
        return connectingMessage;
    }

    public boolean isSolicitudMessage() {
        return solicitudMessage;
    }

    public void setSolicitudMessage(boolean solicitudMessage) {
        this.solicitudMessage = solicitudMessage;
    }

    public boolean isDisconnectMessage() {
        return disconnectMessage;
    }

    public void setDisconnectMessage(boolean disconnectMessage) {
        this.disconnectMessage = disconnectMessage;
    }

    public boolean isMessageMessage() {
        return messageMessage;
    }

    public void setMessageMessage(boolean messageMessage) {
        this.messageMessage = messageMessage;
    }

    public Mensaje getMensaje() {
        return mensaje;
    }

    public void setMensaje(Mensaje mensaje) {
        this.mensaje = mensaje;
    }
}

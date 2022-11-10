package com.controller;

import com.alibaba.fastjson.JSONObject;
import com.models.Message;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Controller;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@Log4j2
@Controller
@ServerEndpoint("/webrtc") //注解@ServerEndpoint来声明实例化WebSocket服务端
public class WebrtcController {
    /**
     * 这里只做一个最简单的, 只有一个房间, 后面有需要自己可以改
     */
    private static Session offer;
    private static Session answer;

    @OnMessage
    public void onMessage(Session session, String message) {
        final Message data = JSONObject.parseObject(message, Message.class);
        final Message response = Message.builder()
                .operation(data.getOperation())
                .build();

        switch (data.getOperation()) {
            //加入房间
            case "into":
                if (offer == null) {
                    offer = session;
                    response.setMsg("offer");
                } else if (answer == null) {
                    answer = session;
                    response.setMsg("answer");
                } else {
                    response.setMsg("none");
                }
                sendMessage(session, response);
                break;

            case "start":
                sendMessage(offer, response);
                break;

            //发送 offer 的 SDP 对象
            case "send-offer":
                //发送 answer 的 SDP 对象
            case "send-answer":
                //交换 candidate 信息
            case "send-candidate": {
                System.out.println(session.getId()+"=="+data.getOperation() + "[交换候选者信息]：" + data.getMsg());
                sendOther(session, response.setMsg(data.getMsg()));
                break;
            }
        }
    }

    @OnOpen
    public void onOpen(Session session) {
        //System.out.println("当有新的WebSocket连接进入时，对该方法进行回调。");
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        if (offer != null && session.getId().equals(offer.getId())) {
            offer = null;
        } else if (answer != null && session.getId().equals(answer.getId())) {
            answer = null;
        }
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        //System.out.println("当有WebSocket连接关闭时，对该方法进行回调。");
    }

    //TODO 这里才是向对端发送信息
    public static void sendOther(Session session, Object msg) {
        if (offer != null && session.getId().equals(offer.getId())) {
            sendMessage(answer, msg);
        } else if (answer != null && session.getId().equals(answer.getId())) {
            sendMessage(offer, msg);
        }
    }

    public static void sendMessage(Session session, Object msg) {
        sendMessage(session, JSONObject.toJSONString(msg));
    }


    @SneakyThrows
    private static void sendMessage(Session session, String msg) {
        final RemoteEndpoint.Basic basic = session.getBasicRemote();
        basic.sendText(msg);
    }
}

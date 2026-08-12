package com.shiptrackpro.backend.delivery.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class LiveLocationController {

    @MessageMapping("/fleet/live")
    @SendTo("/topic/fleet/live")
    public Map<String, Object> broadcastLocation(Map<String, Object> locationData) {
        // Simple broadcast: whatever comes in goes to all subscribers
        return locationData;
    }
}

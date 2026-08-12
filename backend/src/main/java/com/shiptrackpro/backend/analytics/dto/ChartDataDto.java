package com.shiptrackpro.backend.analytics.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChartDataDto {
    private List<String> labels;
    private List<Double> data;
}

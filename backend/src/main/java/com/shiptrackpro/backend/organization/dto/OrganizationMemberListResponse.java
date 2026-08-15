package com.shiptrackpro.backend.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationMemberListResponse {
    private List<OrganizationMemberResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}

package com.shiptrackpro.backend.search.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.search.dto.SearchResultDto;
import com.shiptrackpro.backend.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResultDto>> search(@RequestParam("q") String query) {
        SearchResultDto result = searchService.globalSearch(query);
        return ResponseEntity.ok(ApiResponse.success("Search completed", result));
    }
}

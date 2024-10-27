function filterHtmlRules(html, filterValue, filterLabels) {
    const $ul = html.find(".rule-list-tab");
    const $li = $ul.find("li");

    $li.hide();
    $li
        .filter(function () {
            const text = $(this).text().toLowerCase();
            let currentLabels = $(this).data('labels')?.split(',') || [];
            if (filterLabels.length) {
                return filterLabels.every(l => currentLabels.includes(l)) && text.indexOf(filterValue) >= 0;
            }
            return text.indexOf(filterValue) >= 0;
        })
        .show();
}


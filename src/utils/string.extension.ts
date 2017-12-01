interface String {
    format(...replacements: any[]): string;
}

if (! String.prototype.format) {
    String.prototype.format = function() {
        const args = arguments;
        return this.replace(/{(\d+)}/g, (match: string, index: number) => {
            return typeof args[index] !== "undefined" ? args[index] : match;
        });
    };
}

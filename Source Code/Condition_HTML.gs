//Converts Condition from HTML code to text string
function decodeCondition(contentHTMLCondition) {
    var document = XmlService.parse('<root>' + contentHTMLCondition + '</root>');
    var root = document.getRootElement();
    var conditionNonBracketed = '';

    function parseChildren(element) {
        var children = element.getAllContent();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.getType() === XmlService.ContentTypes.ELEMENT) {
                var childElement = child.asElement();
                if (childElement.getName() === 'span' && childElement.getAttribute('class') && childElement.getAttribute('class').getValue() === 'mention') {
                    var dataDenotationChar = childElement.getAttribute('data-denotation-char').getValue();
                    var dataValue = childElement.getAttribute('data-value').getValue();

                    // Modifying dataValue based on dataDenotationChar
                    if (dataDenotationChar === '#') {
                        dataValue = "sD_" + dataValue.replace(/\s/g, "$");
                    } else if (dataDenotationChar === '@') {
                        dataValue = "d_" + dataValue.replace(/\s/g, "$");
                    }

                    conditionNonBracketed += dataValue;
                } else {
                    parseChildren(childElement);
                }
            } else if (child.getType() === XmlService.ContentTypes.TEXT) {
                conditionNonBracketed += child.getText();
            }
        }
    }

    parseChildren(root);
    return {
        conditionNonBracketed
    };
}

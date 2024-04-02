function decodeSubject(contentHTMLSubject) {
    var document = XmlService.parse('<root>' + contentHTMLSubject + '</root>');
    var root = document.getRootElement();
    var subjectBracketed = '';

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

                    subjectBracketed += "${" + dataValue + "}";
                } else {
                    parseChildren(childElement);
                }
            } else if (child.getType() === XmlService.ContentTypes.TEXT) {
                subjectBracketed += child.getText();
            }
        }
    }

    parseChildren(root);
    return {
        subjectBracketed
    };
}

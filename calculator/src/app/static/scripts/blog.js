document.addEventListener('DOMContentLoaded', function() {
    const postHeaders = document.querySelectorAll('.post-header');
    
    // Style code blocks with comment highlighting
    styleCodeElements();
    
    postHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Get the content and button elements
            const content = this.nextElementSibling;
            const button = this.querySelector('.expand-btn');
            
            // Toggle active class
            content.classList.toggle('active');
            button.classList.toggle('active');
            
            // Scroll into view if expanding
            if (content.classList.contains('active')) {
                setTimeout(() => {
                    content.scrollIntoView({behavior: 'smooth', block: 'nearest'});
                }, 300);
            }
        });
    });
    
    // Function to enhance code styling
    function styleCodeElements() {
        // Process all code elements
        const allCodeElements = document.querySelectorAll('.post-content p > code');
        
        allCodeElements.forEach(code => {
            const content = code.innerHTML;
            
            // Check if it contains line breaks (i.e., it's a code block)
            if (content.includes('<br>')) {
                // Add class for styling
                code.classList.add('code-block');
                
                // Highlight comments
                let enhancedContent = content.replace(
                    /(#.*?)(<br>|$)/g, 
                    '<span class="comment">$1</span>$2'
                );
                
                // Ensure proper line breaking
                enhancedContent = enhancedContent.replace(/\s*<br>\s*<br>/g, '<br>');
                
                code.innerHTML = enhancedContent;
            }
        });
    }
});
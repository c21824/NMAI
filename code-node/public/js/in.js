document.getElementById('imageInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.className = 'img-fluid rounded mt-3';
            const previewContainer = document.querySelector('.card-body');
            const existingPreview = previewContainer.querySelector('img.preview');
            if (existingPreview) existingPreview.remove();
            img.className = 'img-fluid rounded mt-3 preview';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});
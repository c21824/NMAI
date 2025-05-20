document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput")
  const previewContainer = document.querySelector(".preview-container")
  const previewPlaceholder = document.querySelector(".preview-placeholder")
  const form = document.querySelector("form")
  const submitButton = document.querySelector("button[type='submit']")
  const resultContainer = document.querySelector(".result-container")

  // Show result container if it has content
  if (resultContainer && resultContainer.querySelector(".card-body").innerHTML.trim() !== "") {
    resultContainer.classList.add("show")
  }

  // Handle image preview
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Remove placeholder text
        if (previewPlaceholder) {
          previewPlaceholder.style.display = "none"
        }

        // Add or update preview image
        let img = previewContainer.querySelector("img.preview")
        if (!img) {
          img = new Image()
          img.className = "img-fluid preview mt-2"
          previewContainer.appendChild(img)
        }

        img.src = e.target.result
        previewContainer.classList.add("has-image")
      }
      reader.readAsDataURL(file)
    }
  })

  // Handle form submission
  form.addEventListener("submit", (e) => {
    if (!imageInput.files.length) {
      e.preventDefault()
      alert("Vui lòng chọn một hình ảnh để tải lên")
      return
    }

    // Show loading state
    submitButton.disabled = true
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...'
  })
})

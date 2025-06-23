import cv2
import numpy as np

def select_roi(image):
    # Let the user select ROI via GUI
    r = cv2.selectROI("Select Sensitive Area", image, fromCenter=False, showCrosshair=True)
    cv2.destroyAllWindows()
    x, y, w, h = map(int, r)
    return (x, y, x + w, y + h)

def degrade_and_blur_region(image_path, output_path,
                            resize_factor=0.5,
                            noise_std=10,
                            blur_kernel_size=(7, 7)):
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    # Step 1: Select region interactively
    x1, y1, x2, y2 = select_roi(image)
    roi = image[y1:y2, x1:x2]

    # Step 2: Resize down and up (quality degradation)
    h, w = roi.shape[:2]
    small = cv2.resize(roi, (int(w * resize_factor), int(h * resize_factor)))
    degraded = cv2.resize(small, (w, h))

    # Step 3: Add Gaussian noise
    noise = np.random.normal(0, noise_std, degraded.shape).astype(np.float32)
    noisy = np.clip(degraded.astype(np.float32) + noise, 0, 255).astype(np.uint8)

    # Step 4: Apply Gaussian blur
    # blurred = cv2.GaussianBlur(noisy, blur_kernel_size, 0)

    # Step 5: Replace blurred region in original image
    result = image.copy()
    result[y1:y2, x1:x2] = noisy

    # Save final image
    cv2.imwrite(output_path, result)
    print(f"Image saved with obfuscated region to {output_path}")

# Example usage
# degrade_and_blur_region("passport.jpg", "passport_obfuscated.jpg")

# Example usage:

degrade_and_blur_region("input.jpg", "output.jpg", resize_factor=1, noise_std=10,
                       blur_kernel_size=(7,7))

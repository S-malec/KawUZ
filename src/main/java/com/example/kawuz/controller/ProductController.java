package com.example.kawuz.controller;

import com.example.kawuz.entity.Product;
import com.example.kawuz.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.awt.Color;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import org.springframework.http.MediaType;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")



public class ProductController {
    ProductService productService;

    private final String UPLOAD_DIR = "frontend/kawuz-react/public/images/";

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(){
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id){

        Product product = productService.getProductById(id);

        if(product != null)
            return new ResponseEntity<>(product, HttpStatus.OK);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,
                                                @RequestBody Product product){

        Product product1 = null;
        product1 = productService.updateProduct(product, id);

        if (product1 != null)
            return new ResponseEntity<>("Updated", HttpStatus.OK);
        else
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);

    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id){
        Product product = productService.getProductById(id);
        if(product != null) {
            productService.deleteProduct(id);
            return new ResponseEntity<>("Deleted", HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/product/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> results = productService.searchProducts(keyword);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/product")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.addProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @GetMapping("/product/top10")
    public ResponseEntity<List<Product>> getTop10Products() {
        List<Product> topProducts = productService.getTop10Products();
        return new ResponseEntity<>(topProducts, HttpStatus.OK);
    }

    @PostMapping(value = "/product", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Product> createProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Product savedProduct = productService.addProduct(product);

        if (image != null && !image.isEmpty()) {
            saveImage(image, savedProduct.getName());
        }

        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @PutMapping(value = "/product/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<String> updateProduct(
            @PathVariable int id,
            @RequestPart("product") Product product,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Product updatedProduct = productService.updateProduct(product, id);

        if (updatedProduct != null) {
            if (image != null && !image.isEmpty()) {
                saveImage(image, updatedProduct.getName());
            }
            return new ResponseEntity<>("Updated", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/product/{id}/pdf")
    public void generatePdf(@PathVariable int id, HttpServletResponse response) throws IOException {
        Product product = productService.getProductById(id);

        if (product == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Product not found");
            return;
        }

        response.setContentType("application/pdf");
        String filename = "oferta_" + product.getName().replace(" ", "_") + ".pdf";
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        BaseFont helvetica = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1250, BaseFont.EMBEDDED);
        BaseFont helveticaBold = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1250, BaseFont.EMBEDDED);

        Font fontTitle = new Font(helveticaBold, 22, Font.NORMAL);
        Font fontPrice = new Font(helveticaBold, 16, Font.NORMAL, Color.RED);
        Font fontNormal = new Font(helvetica, 12, Font.NORMAL);
        Font fontLabel = new Font(helveticaBold, 12, Font.NORMAL);
        BaseFont arial = BaseFont.createFont("c:/windows/fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        Font fontDots = new Font(arial, 16, Font.NORMAL, Color.DARK_GRAY);

        Paragraph title = new Paragraph(product.getName(), fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new int[]{4, 6});

        PdfPCell imageCell = new PdfPCell();
        imageCell.setBorder(Rectangle.NO_BORDER);
        imageCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        try {
            String imagePath = UPLOAD_DIR + product.getName() + ".png";
            Image img = Image.getInstance(imagePath);
            img.scaleToFit(180, 250);
            imageCell.addElement(img);
        } catch (Exception e) {
            System.out.println("Nie znaleziono zdjęcia dla PDF: " + e.getMessage());
            Paragraph noPhoto = new Paragraph("\n[Brak zdjęcia poglądowego]\n", fontNormal);
            noPhoto.setAlignment(Element.ALIGN_CENTER);
            imageCell.addElement(noPhoto);
        }
        table.addCell(imageCell);

        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.setPaddingLeft(20);

        textCell.addElement(new Paragraph(product.getPrice() + " zł", fontPrice));
        textCell.addElement(new Paragraph("Waga: " + product.getWeight(), fontNormal));

        textCell.addElement(new Paragraph(" ", fontNormal));

        if (product.getDescription() != null) {
            textCell.addElement(new Paragraph("O kawie:", fontLabel));
            textCell.addElement(new Paragraph(product.getDescription(), fontNormal));
        }

        textCell.addElement(new Paragraph(" ", fontNormal));

        textCell.addElement(new Paragraph("Palenie:       " + makeDots(product.getRoastLevel()), fontDots));
        textCell.addElement(new Paragraph("Kwasowość:  " + makeDots(product.getAcidity()), fontDots));
        textCell.addElement(new Paragraph("Słodycz:       " + makeDots(product.getSweetness()), fontDots));
        textCell.addElement(new Paragraph("Kofeina:       " + makeDots(product.getCaffeineLevel()), fontDots));

        table.addCell(textCell);

        document.add(table);

        document.add(new Paragraph("\n\n-----------------------------"));
        document.add(new Paragraph("Wygenerowano z aplikacji KawUZ", new Font(helvetica, 10, Font.ITALIC, Color.GRAY)));

        document.close();
    }

    // --- Metoda pomocnicza do rysowania kropek (●●●○○) ---
    private String makeDots(int level) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            if (i < level) {
                // Używam "O" jako pełnej kropki i "-" jako pustej, bo standardowe kropki unicode
                // mogą czasem znikać w starych wersjach PDF, ale spróbujmy kropek:
                sb.append("●");
            } else {
                sb.append("○");
            }
        }
        return sb.toString();
    }

    private void saveImage(MultipartFile file, String productName) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Zapisujemy jako nazwa_produktu.png
            String fileName = productName + ".png";
            Path filePath = uploadPath.resolve(fileName);

            // Nadpisujemy jeśli już istnieje
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("Zapisano zdjęcie: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Błąd zapisu pliku: " + e.getMessage());
        }
    }
}


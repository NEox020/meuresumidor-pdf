using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Text;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using iText.Kernel.Pdf.Canvas.Parser.Listener.Filter;
using iText.Kernel.Pdf.Canvas.Parser.Listener.Filter.Text;
using iText.Kernel.Pdf.Canvas.Parser.Listener.Filter.Text.Filter;

namespace ResumidorWeb.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ResumirPdf()
        {
            var pdfPath = "caminho_para_seu_arquivo.pdf";
            var extractedText = ExtractTextFromPDF(pdfPath);

            var numSentences = 5;
            var summary = GenerateSummary(extractedText, numSentences);

            ViewBag.ExtractedText = extractedText;
            ViewBag.Summary = summary;

            return View("Index");
        }

        private static string ExtractTextFromPDF(string pdfPath)
        {
            StringBuilder text = new StringBuilder();

            using (var pdfReader = new PdfReader(pdfPath))
            {
                using (var pdfDoc = new PdfDocument(pdfReader))
                {
                    for (int pageNum = 1; pageNum <= pdfDoc.GetNumberOfPages(); pageNum++)
                    {
                        var textFilter = new TextRegionEventFilter(new System.Drawing.Rectangle(0, 0, int.MaxValue, int.MaxValue));
                        var strategy = new FilteredTextEventListener(new LocationTextExtractionStrategy(), textFilter);
                        var parser = new PdfCanvasProcessor(strategy);

                        parser.ProcessPageContent(pdfDoc.GetPage(pageNum));
                        text.AppendLine(strategy.GetResultantText());
                    }
                }
            }

            return text.ToString();
        }

        private static string GenerateSummary(string text, int numSentences)
        {
            string[] sentences = text.Split('.', '!', '?');
            StringBuilder summary = new StringBuilder();

            for (int i = 0; i < Math.Min(numSentences, sentences.Length); i++)
            {
                summary.Append(sentences[i].Trim() + ". ");
            }

            return summary.ToString().Trim();
        }
    }
}

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Copy, Download } from "lucide-react";
import { generateUnifiedCode } from "../../utils/unifiedCodeGenerator";

interface BlockData {
  [key: string]: unknown;
}

interface Block {
  blockType: string;
  blockData: BlockData;
}

interface CodePreviewProps {
  blocks: Block[];
}

const CodePreview: React.FC<CodePreviewProps> = ({ blocks }) => {
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    if (blocks && blocks.length > 0) {
      try {
        // 使用統一代碼生成器，將舊格式積木轉換後生成代碼
        const code = generateUnifiedCode(blocks);
        setGeneratedCode(code);
      } catch (error) {
        console.error("代碼生成錯誤:", error);
        setGeneratedCode(`# 代碼生成過程中發生錯誤
# 錯誤信息：${error instanceof Error ? error.message : '未知錯誤'}
# 請檢查積木配置或聯繫開發人員

# 以下是基本的 LINE Bot 模板
from flask import Flask, request, abort
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import MessageEvent, TextMessage, TextSendMessage

app = Flask(__name__)

# 請替換為您的 LINE Bot 憑證
line_bot_api = LineBotApi('YOUR_CHANNEL_ACCESS_TOKEN')
handler = WebhookHandler('YOUR_CHANNEL_SECRET')

@app.route("/callback", methods=['POST'])
def callback():
    signature = request.headers['X-Line-Signature']
    body = request.get_data(as_text=True)
    
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)
    
    return 'OK'

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text="Hello, World!")
    )

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
`);
      }
    } else {
      setGeneratedCode("# 請先在邏輯編輯器中加入積木來生成程式碼");
    }
  }, [blocks]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    // 可以加入成功提示
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linebot.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-600">生成的程式碼</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            複製
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="w-4 h-4 mr-2" />
            下載
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto">
        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
          {generatedCode}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          💡 提示：請記得將 YOUR_CHANNEL_ACCESS_TOKEN 和 YOUR_CHANNEL_SECRET
          替換為您的 LINE Bot 憑證
        </p>
      </div>
    </div>
  );
};

export default CodePreview;

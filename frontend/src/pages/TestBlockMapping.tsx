import React, { useState, useEffect } from 'react';
import DroppedBlock from '../components/visual-editor/DroppedBlock';
import { blockRegistry } from '../components/visual-editor/blocks/registry';
import { initializeBlocks } from '../components/visual-editor/blocks';
import { runMappingSystemTests, mappingSystemHealthCheck } from '../components/visual-editor/test/mappingSystemTest';
import { 
  mapBlockType, 
  getBlockTypeInfo, 
  searchBlocks,
  getMappingStatistics,
  getAllBlockAliases
} from '../components/visual-editor/utils/blockMapping';

interface BlockData {
  [key: string]: unknown;
  title?: string;
  replyType?: string;
  eventType?: string;
  controlType?: string;
  containerType?: string;
  contentType?: string;
  layoutType?: string;
  text?: string;
  content?: string;
}

interface Block {
  blockType: string;
  blockData: BlockData;
}

/**
 * 積木映射測試頁面
 * 用於驗證 DroppedBlock 組件的映射功能是否正常工作
 */
const TestBlockMapping: React.FC = () => {
  const [testBlocks, setTestBlocks] = useState<Block[]>([]);
  const [blocksInitialized, setBlocksInitialized] = useState(false);
  const [initializationLog, setInitializationLog] = useState<string[]>([]);
  const [mappingStats, setMappingStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'mapping' | 'tests'>('blocks');

  // 測試用的積木數據
  const sampleBlocks: Block[] = [
    {
      blockType: "reply",
      blockData: {
        title: "回覆文字訊息",
        replyType: "text",
        text: "這是一個測試文字回覆",
      }
    },
    {
      blockType: "reply", 
      blockData: {
        title: "回覆圖片訊息",
        replyType: "image",
        imageUrl: "https://example.com/image.jpg"
      }
    },
    {
      blockType: "event",
      blockData: {
        title: "當收到文字訊息時",
        eventType: "message.text",
        condition: "任何文字"
      }
    },
    {
      blockType: "flex-content",
      blockData: {
        title: "文字內容",
        contentType: "text",
        text: "測試Flex文字"
      }
    },
    {
      blockType: "text-reply", // 新格式ID，應該直接找到
      blockData: {
        title: "新格式文字回覆",
        text: "這是新格式的積木"
      }
    }
  ];

  useEffect(() => {
    const initializeAndTest = async () => {
      setInitializationLog(prev => [...prev, "開始初始化積木系統..."]);
      
      try {
        const result = await initializeBlocks();
        
        if (result.success) {
          setInitializationLog(prev => [...prev, `✅ 積木初始化成功，載入 ${result.blocksLoaded} 個積木`]);
          setBlocksInitialized(true);
          
          // 檢查註冊表狀態
          const stats = blockRegistry.getStatistics();
          setInitializationLog(prev => [...prev, `📊 積木統計: 總計 ${stats.total}，啟用 ${stats.enabled}`]);
          
          // 設置測試積木
          setTestBlocks(sampleBlocks);
          
          // 測試映射功能
          setInitializationLog(prev => [...prev, "開始測試積木映射..."]);
          sampleBlocks.forEach((block, index) => {
            // 這裡我們可以手動測試映射邏輯
            const originalType = block.blockType;
            const hasDefinition = blockRegistry.getBlock(originalType);
            
            setInitializationLog(prev => [...prev, 
              `測試 ${index + 1}: ${originalType} → ${hasDefinition ? '找到定義' : '需要映射'}`
            ]);
          });
          
        } else {
          setInitializationLog(prev => [...prev, `❌ 積木初始化失敗: ${result.errors.join(', ')}`]);
        }
      } catch (error) {
        setInitializationLog(prev => [...prev, `💥 初始化錯誤: ${error}`]);
      }
    };

    initializeAndTest();
  }, []);

  const handleBlockUpdate = (index: number, data: BlockData) => {
    setTestBlocks(prev => prev.map((block, i) => 
      i === index ? { ...block, blockData: { ...block.blockData, ...data } } : block
    ));
    setInitializationLog(prev => [...prev, `更新積木 ${index}: ${JSON.stringify(data)}`]);
  };

  const handleBlockRemove = (index: number) => {
    setTestBlocks(prev => prev.filter((_, i) => i !== index));
    setInitializationLog(prev => [...prev, `移除積木 ${index}`]);
  };

  const clearLog = () => {
    setInitializationLog([]);
  };

  const addTestBlock = () => {
    const newBlock: Block = {
      blockType: "reply",
      blockData: {
        title: `新測試積木 ${testBlocks.length + 1}`,
        replyType: "text",
        text: "動態添加的測試積木"
      }
    };
    setTestBlocks(prev => [...prev, newBlock]);
  };

  const runMappingTests = async () => {
    setInitializationLog(prev => [...prev, "🧪 開始執行映射系統測試..."]);
    try {
      const results = runMappingSystemTests();
      setTestResults(results);
      setInitializationLog(prev => [...prev, 
        `✅ 映射測試完成: ${results.passed} 通過, ${results.failed} 失敗`
      ]);
    } catch (error) {
      setInitializationLog(prev => [...prev, `❌ 映射測試錯誤: ${error}`]);
    }
  };

  const runHealthCheck = () => {
    setInitializationLog(prev => [...prev, "🏥 執行健康檢查..."]);
    try {
      const health = mappingSystemHealthCheck();
      setMappingStats(health);
      setInitializationLog(prev => [...prev, "✅ 健康檢查完成"]);
    } catch (error) {
      setInitializationLog(prev => [...prev, `❌ 健康檢查錯誤: ${error}`]);
    }
  };

  const testSpecificMapping = (oldType: string) => {
    const newType = mapBlockType(oldType);
    const info = getBlockTypeInfo(oldType);
    
    setInitializationLog(prev => [...prev, 
      `🔄 映射測試: "${oldType}" → "${newType}"`
    ]);
    
    if (info) {
      setInitializationLog(prev => [...prev, 
        `📝 積木資訊: ${info.displayName} (${info.category})`
      ]);
    }
    
    return { oldType, newType, info };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            積木映射功能測試頁面
          </h1>
          <p className="text-gray-600 mb-4">
            此頁面用於測試 DroppedBlock 組件的積木ID映射功能，確保舊格式積木能正確映射到新的配置系統。
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${blocksInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">
                積木系統狀態: {blocksInitialized ? '已初始化' : '初始化中...'}
              </span>
            </div>
            <button
              onClick={addTestBlock}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!blocksInitialized}
            >
              添加測試積木
            </button>
            <button
              onClick={runMappingTests}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={!blocksInitialized}
            >
              執行映射測試
            </button>
            <button
              onClick={runHealthCheck}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              健康檢查
            </button>
            <button
              onClick={clearLog}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              清除日誌
            </button>
          </div>
          
          {/* 頁籤導航 */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'blocks'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              積木測試
            </button>
            <button
              onClick={() => setActiveTab('mapping')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'mapping'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              映射系統
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'tests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              測試結果
            </button>
          </div>
        </div>

        {/* 內容區域 */}
        {activeTab === 'blocks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 積木測試區域 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                積木測試區域 ({testBlocks.length} 個積木)
              </h2>
              
              {!blocksInitialized ? (
                <div className="text-center py-8 text-gray-500">
                  正在初始化積木系統，請稍候...
                </div>
              ) : testBlocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  沒有測試積木，點擊上方按鈕添加測試積木
                </div>
              ) : (
                <div className="space-y-4">
                  {testBlocks.map((block, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-2">
                        積木 {index + 1}: {block.blockType}
                        {block.blockData.replyType && ` (${block.blockData.replyType})`}
                        {block.blockData.eventType && ` (${block.blockData.eventType})`}
                        {block.blockData.contentType && ` (${block.blockData.contentType})`}
                      </div>
                      
                      <DroppedBlock
                        block={block}
                        index={index}
                        onUpdate={handleBlockUpdate}
                        onRemove={handleBlockRemove}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 日誌區域 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                系統日誌
              </h2>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {initializationLog.length === 0 ? (
                  <div className="text-gray-500">等待日誌輸出...</div>
                ) : (
                  <div className="space-y-1">
                    {initializationLog.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {new Date().toLocaleTimeString()} - {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 映射統計 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                映射系統統計
              </h2>
              
              {mappingStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800">總映射數</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {mappingStats.mappingStats?.totalMappings || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">總別名數</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {mappingStats.totalAliases || 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">類別統計</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {mappingStats.mappingStats?.categoryStats && 
                        Object.entries(mappingStats.mappingStats.categoryStats).map(([category, count]) => (
                          <div key={category} className="flex justify-between">
                            <span>{category}:</span>
                            <span className="font-semibold">{count as number}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">覆蓋率</h3>
                    <p className="text-lg font-bold text-yellow-600">
                      {mappingStats.mappingStats?.coveragePercentage?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  點擊 "健康檢查" 按鈕來獲取映射統計資料
                </div>
              )}
            </div>

            {/* 映射測試工具 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                映射測試工具
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">快速測試常見映射</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['event', 'reply', 'flex-container', 'text', 'button', 'control'].map(type => (
                      <button
                        key={type}
                        onClick={() => testSpecificMapping(type)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                      >
                        測試 "{type}"
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">別名搜尋</h3>
                  <input
                    type="text"
                    placeholder="輸入積木類型或關鍵字搜尋..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const query = e.target.value;
                      if (query.length > 0) {
                        const results = searchBlocks(query);
                        setInitializationLog(prev => [...prev, 
                          `🔍 搜尋 "${query}": 找到 ${results.length} 個結果`
                        ]);
                        if (results.length > 0) {
                          results.slice(0, 3).forEach(result => {
                            setInitializationLog(prev => [...prev, 
                              `  - ${result.primaryId}: ${result.displayName}`
                            ]);
                          });
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              測試結果詳情
            </h2>
            
            {testResults ? (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg flex-1">
                    <h3 className="font-semibold text-green-800">通過測試</h3>
                    <p className="text-2xl font-bold text-green-600">{testResults.passed}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg flex-1">
                    <h3 className="font-semibold text-red-800">失敗測試</h3>
                    <p className="text-2xl font-bold text-red-600">{testResults.failed}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">詳細結果:</h3>
                  <div className="max-h-96 overflow-y-auto">
                    {testResults.results.map((result: any, index: number) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded border-l-4 ${
                          result.passed 
                            ? 'bg-green-50 border-green-400' 
                            : 'bg-red-50 border-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                            {result.passed ? '✅' : '❌'}
                          </span>
                          <h4 className="font-semibold">{result.testName}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                        {result.error && (
                          <p className="text-sm text-red-600 mt-1 font-mono">{result.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                點擊 "執行映射測試" 按鈕來運行完整的測試套件
              </div>
            )}
          </div>
        )}

        {/* 說明區域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            測試說明
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">測試項目：</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>舊格式回覆積木映射 (reply + replyType)</li>
                <li>舊格式事件積木映射 (event + eventType)</li>
                <li>Flex Message 積木映射</li>
                <li>新格式積木直接識別</li>
                <li>配置系統渲染測試</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">預期結果：</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>所有積木都能正確顯示標題</li>
                <li>編輯模式顯示配置選項</li>
                <li>映射警告應該出現在控制台</li>
                <li>新配置系統正確渲染</li>
                <li>錯誤處理優雅降級</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBlockMapping;
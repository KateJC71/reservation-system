import React from 'react';
import { Link } from 'react-router-dom';
import { MountainSnow, Calendar, Shield, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-snow-900 mb-6">
            專業雪具預約系統
          </h1>
          <p className="text-xl text-snow-600 mb-8 max-w-2xl mx-auto">
            提供高品質的滑雪裝備租賃服務，讓您的滑雪之旅更加完美
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reservation" className="btn-primary text-lg px-8 py-3">
              立即預約
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-snow-900 mb-12">
            為什麼選擇我們
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <MountainSnow className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">專業裝備</h3>
              <p className="text-snow-600">
                提供各種品牌的高品質滑雪裝備，包括滑雪板、雪板、靴子等
              </p>
            </div>
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">便捷預約</h3>
              <p className="text-snow-600">
                線上預約系統，24小時隨時預約，快速確認
              </p>
            </div>
            <div className="card text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">安全保障</h3>
              <p className="text-snow-600">
                所有裝備定期檢查維護，確保安全可靠
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-snow-900 mb-12">
            裝備分類
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: '滑雪板', category: 'ski', description: '專業滑雪板，適合各種地形' },
              { name: '雪板', category: 'snowboard', description: '全山型雪板，自由滑行' },
              { name: '滑雪靴', category: 'boots', description: '舒適保暖的滑雪靴' },
              { name: '安全帽', category: 'helmet', description: '高安全性滑雪安全帽' },
            ].map((item) => (
              <Link
                key={item.category}
                to={`/equipment?category=${item.category}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="text-center">
                  <MountainSnow className="h-8 w-8 text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm text-snow-600">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-snow-900 mb-12">
            客戶評價
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-snow-700 mb-4">
                "裝備品質很好，預約流程很順暢，服務人員也很專業！"
              </p>
              <p className="text-sm text-snow-600">- 張先生</p>
            </div>
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-snow-700 mb-4">
                "第一次滑雪就選擇這裡，裝備很適合初學者，推薦！"
              </p>
              <p className="text-sm text-snow-600">- 李小姐</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
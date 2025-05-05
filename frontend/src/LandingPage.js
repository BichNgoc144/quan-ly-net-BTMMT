import React, { useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bắt buộc để dùng Carousel JS

const LandingPage = () => {
    useEffect(() => {
        const carouselEl = document.querySelector('#bannerCarousel');
        if (carouselEl && window.bootstrap?.Carousel) {
            new window.bootstrap.Carousel(carouselEl, {
                interval: 10000,
                ride: 'carousel'
            });
        }
    }, []);

    return (
        <div style={{ backgroundColor: '#f0f0f0' }}>

            {/* Carousel Banner */}
            <div
                id="bannerCarousel"
                className="carousel slide"
                data-bs-ride="carousel"
                data-bs-interval="10000"
            >
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <img
                            src="https://khoinguonsangtao.vn/wp-content/uploads/2021/12/hinh-nen-may-tinh-4k-game-lien-minh.jpg"
                            className="d-block w-100"
                            alt="Banner 1"
                            style={{ height: '500px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="carousel-item">
                        <img
                            src="https://symbols.vn/wp-content/uploads/2021/10/Hinh-anh-HD-tuong-Lien-Quan-dep.jpg"
                            className="d-block w-100"
                            alt="Banner 2"
                            style={{ height: '500px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="carousel-item">
                        <img
                            src="https://symbols.vn/wp-content/uploads/2021/10/Hinh-nen-may-tinh-HD-Lien-Quan.jpg"
                            className="d-block w-100"
                            alt="Banner 3"
                            style={{ height: '500px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="carousel-item">
                        <img
                            src="https://img5.thuthuatphanmem.vn/uploads/2021/12/11/anh-nen-tuong-trieu-van-lqm_102509985.jpg"
                            className="d-block w-100"
                            alt="Banner 4"
                            style={{ height: '500px', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="carousel-item">
                        <img
                            src="https://cdn2.fptshop.com.vn/unsafe/anh_lauriel_8_63836780fd.jpg"
                            className="d-block w-100"
                            alt="Banner 5"
                            style={{ height: '500px', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* Nút chuyển slide */}
                <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Panel 1 */}
            <div className="container py-5">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <img
                            src="https://thanhcongcomputer.vn/wp-content/uploads/2020/07/mytnhchigameasus.jpg"
                            alt="Phòng máy hiện đại"
                            className="img-fluid rounded"
                        />
                    </div>
                    <div className="col-md-6">
                        <h4>Phòng máy cấu hình cao</h4>
                        <p>Trang bị CPU Intel i7, RAM 32GB, màn hình 240Hz, đem lại trải nghiệm mượt mà cho mọi tựa game hot nhất.</p>
                    </div>
                </div>
            </div>

            {/* Panel 2 */}
            <div className="container py-5 bg-light">
                <div className="row align-items-center">
                    <div className="col-md-6 order-md-2">
                        <img
                            src="https://lapdatphongnet.com.vn/wp-content/uploads/2020/07/a-long-son-la-4.jpg"
                            alt="Khu vực ăn uống"
                            className="img-fluid rounded"
                        />
                    </div>
                    <div className="col-md-6 order-md-1">
                        <h4>Khu vực giải lao tiện nghi</h4>
                        <p>Phục vụ nước uống, đồ ăn nhẹ, giúp bạn có thể chơi game xuyên suốt mà không phải lo nghĩ.</p>
                    </div>
                </div>
            </div>

            {/* Panel 3 */}
            <div className="container py-5">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <img
                            src="https://toplist.vn/images/800px/quan-net-chat-nhat-o-ha-noi-chuyen-danh-cho-game-thu-156744.jpg"
                            alt="Thi đấu giải"
                            className="img-fluid rounded"
                        />
                    </div>
                    <div className="col-md-6">
                        <h4>Sân chơi cộng đồng</h4>
                        <p>Thường xuyên tổ chức giải đấu cộng đồng, giao lưu các team và phát triển phong trào eSports.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-dark text-white text-center py-4">
                <h5>Liên hệ</h5>
                <p>📍 123 Lê Lợi, TP. Lào Cai</p>
                <p>📞 0987 654 321 | ✉️ netzone@example.com</p>
                <p>⏰ Giờ mở cửa: 8:00 - 24:00</p>
            </footer>
        </div>
    );
};

export default LandingPage;

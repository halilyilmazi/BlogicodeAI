pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Kaynak kod çekiliyor...'
                checkout scm
            }
        }

        stage('Build and Deploy') {
            steps {
                echo 'Docker servisleri durdurulup yeniden derleniyor...'
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Servisler başlatılıyor, 10 saniye bekleniyor...'
                sh 'sleep 10'
                echo 'API sağlık kontrolü yapılıyor...'
                sh 'curl -f http://localhost:5000/api/health || (echo "API sağlık kontrolü başarısız!" && exit 1)'
                echo 'Mobil uygulama sağlık kontrolü yapılıyor...'
                sh 'curl -f http://localhost:19006 || (echo "Mobil uygulama sağlık kontrolü başarısız!" && exit 1)'
                echo 'Tüm servisler çalışıyor!'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline başarıyla tamamlandı! BlogicodeAI servisleri ayakta.'
        }
        failure {
            echo '❌ Pipeline başarısız oldu. Loglara bakınız.'
        }
    }
}

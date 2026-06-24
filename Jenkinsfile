pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Kaynak kod çekiliyor...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Docker imajları derleniyor...'
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Önceki servisler durduruluyor ve yeni sürüm ayağa kaldırılıyor...'
                sh 'docker compose down || true'
                sh 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Servislerin başlaması bekleniyor (15 sn)...'
                sh 'sleep 15'
                echo 'REST API sağlık kontrolü yapılıyor...'
                sh 'curl -f http://localhost:3000/api/health || (echo "API sağlık kontrolü başarısız!" && exit 1)'
                echo 'Web arayüzü sağlık kontrolü yapılıyor...'
                sh 'curl -f http://localhost:3000/ || (echo "Web arayüzü sağlık kontrolü başarısız!" && exit 1)'
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

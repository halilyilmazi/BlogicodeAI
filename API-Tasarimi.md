# API Tasarımı - OpenAPI Specification Örneği

**OpenAPI Spesifikasyon Dosyası:** [blogicodeai.yaml](blogicodeai.yaml)

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış API tasarımını içermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: BlogicodeAI REST API
  description: |
    BlogicodeAI platformu için RESTful API tasarımı.
    
    ## Özellikler
    - Kullanıcı Kimlik Doğrulama ve Profil Yönetimi
    - Blog Yazısı (Post) İşlemleri
    - Yorum (Comment) Sistemi
    - Trend Konular için AI Asistanı (Chatbot)
    - JWT tabanlı yetkilendirme
  version: 1.0.0
  contact:
    name: Halil Yılmaz
    email: ylmzyzlm@gmail.com
    url: https://blogicode-ai.vercel.app

servers:
  - url: https://blogicode-ai.vercel.app/api
    description: Production server
  - url: http://localhost:3000/api
    description: Development server

tags:
  - name: auth
    description: Kayıt ve giriş işlemleri
  - name: users
    description: Kullanıcı profili yönetimi
  - name: posts
    description: Blog yazıları ve listeleme
  - name: comments
    description: Yazılara yapılan yorumlar
  - name: chatbot
    description: AI Asistan ile anlık mesajlaşma

paths:
  /auth/register:
    post:
      tags:
        - auth
      summary: Yeni kullanıcı kaydı
      description: Ad-soyad, email ve şifre ile sisteme yeni kullanıcı kaydeder.
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegistration'
      responses:
        '201':
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: Email adresi zaten kullanımda
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/login:
    post:
      tags:
        - auth
      summary: Kullanıcı girişi
      description: Email ve şifre ile giriş yapar, doğrulama için token döner.
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginCredentials'
      responses:
        '200':
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /users/{id}:
    get:
      tags:
        - users
      summary: Profil görüntüleme
      description: Kullanıcının profil bilgilerini ve yazdığı blogları getirir.
      operationId: getUserProfile
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '404':
          $ref: '#/components/responses/NotFound'
    
    put:
      tags:
        - users
      summary: Profil güncelleme
      description: Kullanıcı profil fotoğrafı, biyografi ve kullanıcı adını günceller.
      operationId: updateUser
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IdParam'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: Profil başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

    delete:
      tags:
        - users
      summary: Hesap silme
      description: Kullanıcının hesabını sistemden kalıcı olarak siler.
      operationId: deleteUser
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '204':
          description: Kullanıcı hesabı başarıyla silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /posts:
    get:
      tags:
        - posts
      summary: Blog yazılarını listeleme
      description: Blog yazılarını tarih/popülerlik sırasına göre listeler. Kategori/etiket filtresi içerir.
      operationId: listPosts
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: category
          in: query
          description: Kategoriye göre filtrele
          schema:
            type: string
        - name: tag
          in: query
          description: Etikete göre filtrele
          schema:
            type: string
        - name: sortBy
          in: query
          description: Sıralama kriteri
          schema:
            type: string
            enum: [date, popularity]
            default: date
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PostList'

    post:
      tags:
        - posts
      summary: Blog yazısı oluşturma
      description: Giriş yapmış kullanıcı yeni bir blog yazısı oluşturur.
      operationId: createPost
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PostCreate'
      responses:
        '201':
          description: Yazı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Post'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /posts/{id}:
    delete:
      tags:
        - posts
      summary: Blog yazısı silme
      description: Yazının sahibi kendi yazısını kalıcı olarak silebilir.
      operationId: deletePost
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '204':
          description: Yazı başarıyla silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /posts/{id}/comments:
    post:
      tags:
        - comments
      summary: Yorum ekleme
      description: Kullanıcılar belirtilen blog yazısına yorum ekler.
      operationId: addComment
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IdParam'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CommentCreate'
      responses:
        '201':
          description: Yorum eklendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Comment'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /comments/{id}:
    delete:
      tags:
        - comments
      summary: Yorum silme
      description: Kullanıcı kendi yazdığı yorumu silebilir.
      operationId: deleteComment
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        '204':
          description: Yorum silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /chatbot:
    post:
      tags:
        - chatbot
      summary: AI Asistanı ile sohbet
      description: Kullanıcı trend konular hakkında chatbot ile anlık mesajlaşır (Kayıt tutulmaz).
      operationId: askChatbot
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
      responses:
        '200':
          description: AI yanıtı alındı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token ile kimlik doğrulama

  parameters:
    IdParam:
      name: id
      in: path
      required: true
      description: İlgili kaynağın benzersiz ID'si
      schema:
        type: string
        format: uuid
    
    PageParam:
      name: page
      in: query
      description: Sayfa numarası
      schema:
        type: integer
        minimum: 1
        default: 1
    
    LimitParam:
      name: limit
      in: query
      description: Sayfa başına kayıt sayısı
      schema:
        type: integer
        minimum: 1
        maximum: 50
        default: 10

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        firstName:
          type: string
        lastName:
          type: string
        username:
          type: string
        email:
          type: string
          format: email
        bio:
          type: string
        profilePhoto:
          type: string
          format: uri
        createdAt:
          type: string
          format: date-time

    UserProfile:
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            posts:
              type: array
              items:
                $ref: '#/components/schemas/Post'

    UserRegistration:
      type: object
      required:
        - firstName
        - lastName
        - email
        - password
      properties:
        firstName:
          type: string
          minLength: 2
        lastName:
          type: string
          minLength: 2
        email:
          type: string
          format: email
        password:
          type: string
          format: password
          minLength: 6

    UserUpdate:
      type: object
      properties:
        username:
          type: string
          minLength: 3
        bio:
          type: string
        profilePhoto:
          type: string
          format: uri

    LoginCredentials:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    AuthToken:
      type: object
      properties:
        token:
          type: string
          description: JWT access token
        expiresIn:
          type: integer
        user:
          $ref: '#/components/schemas/User'

    Post:
      type: object
      properties:
        id:
          type: string
          format: uuid
        authorId:
          type: string
          format: uuid
        title:
          type: string
        content:
          type: string
        category:
          type: string
        tags:
          type: array
          items:
            type: string
        viewCount:
          type: integer
        createdAt:
          type: string
          format: date-time

    PostCreate:
      type: object
      required:
        - title
        - content
        - category
      properties:
        title:
          type: string
          minLength: 5
        content:
          type: string
          minLength: 20
        category:
          type: string
        tags:
          type: array
          items:
            type: string

    PostList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Post'
        pagination:
          type: object
          properties:
            page:
              type: integer
            limit:
              type: integer
            totalItems:
              type: integer

    Comment:
      type: object
      properties:
        id:
          type: string
          format: uuid
        postId:
          type: string
          format: uuid
        authorId:
          type: string
          format: uuid
        content:
          type: string
        createdAt:
          type: string
          format: date-time

    CommentCreate:
      type: object
      required:
        - content
      properties:
        content:
          type: string
          minLength: 1

    ChatRequest:
      type: object
      required:
        - message
      properties:
        message:
          type: string
          description: Kullanıcının yapay zekaya gönderdiği mesaj

    ChatResponse:
      type: object
      properties:
        reply:
          type: string
          description: Yapay zekanın yanıtı

    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string

  responses:
    BadRequest:
      description: Geçersiz istek
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Yetkisiz erişim (Giriş yapılmamış veya token geçersiz)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Erişim reddedildi (Bu işlemi yapmaya yetkiniz yok)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
``
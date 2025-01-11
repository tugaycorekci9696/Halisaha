import os
import subprocess
from datetime import datetime

def get_current_branch():
    try:
        result = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return 'master'  # Varsayılan branch

def git_push():
    try:
        # Mevcut branch'i al
        current_branch = get_current_branch()
        print(f"📂 Mevcut branch: {current_branch}")

        # Önce git status kontrolü yap
        status = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, check=True)
        
        # Eğer değişiklik yoksa
        if not status.stdout.strip():
            print("ℹ️ Commit edilecek değişiklik yok.")
            return
        
        # Önce mevcut değişiklikleri al
        try:
            print("🔄 Uzak depodaki değişiklikler alınıyor...")
            subprocess.run(['git', 'pull', 'origin', current_branch, '--rebase'], check=True)
        except subprocess.CalledProcessError:
            print("⚠️ Pull işlemi başarısız oldu, push işlemine devam ediliyor...")
        
        # Git komutlarını çalıştır
        subprocess.run(['git', 'add', '.'], check=True)
        
        # Commit mesajını tarih ile oluştur
        commit_message = f"Otomatik push - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        
        print(f"🔄 GitHub'a push yapılıyor... ({current_branch} branch'ine)")
        # Force push kullan
        subprocess.run(['git', 'push', '-f', 'origin', current_branch], check=True)
        
        print("✅ GitHub'a başarıyla push yapıldı!")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Hata oluştu: {str(e)}")
        print("💡 Çözüm önerileri:")
        print("1. GitHub hesabınızın doğru yapılandırıldığından emin olun")
        print("2. Repository'nin doğru URL'ye sahip olduğunu kontrol edin")
        print("3. İnternet bağlantınızı kontrol edin")
        print(f"4. Branch adının doğru olduğundan emin olun (şu an: {get_current_branch()})")
        
if __name__ == "__main__":
    # Repository yolunu kontrol et
    if not os.path.exists('.git'):
        print("❌ Bu dizin bir git repository'si değil!")
        
        try:
            # Git repository'sini başlat
            print("🔄 Git repository'si başlatılıyor...")
            subprocess.run(['git', 'init'], check=True)
            subprocess.run(['git', 'remote', 'add', 'origin', 'https://github.com/tugaycorekci9696/halisaha.git'], check=True)
            print("✅ Git repository'si başarıyla oluşturuldu!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Repository oluşturulurken hata: {str(e)}")
            exit(1)
    
    git_push() 

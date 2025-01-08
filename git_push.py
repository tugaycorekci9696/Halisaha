import os
import subprocess
from datetime import datetime

def git_push():
    try:
        # Önce git status kontrolü yap
        status = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, check=True)
        
        # Eğer değişiklik yoksa
        if not status.stdout.strip():
            print("ℹ️ Commit edilecek değişiklik yok.")
            return
        
        # Git komutlarını çalıştır
        subprocess.run(['git', 'add', '.'], check=True)
        
        # Commit mesajını tarih ile oluştur
        commit_message = f"Otomatik push - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        
        # GitHub'a push yap
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        
        print("✅ GitHub'a başarıyla push yapıldı!")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Hata oluştu: {str(e)}")
        
if __name__ == "__main__":
    # Repository yolunu kontrol et
    if not os.path.exists('.git'):
        print("❌ Bu dizin bir git repository'si değil!")
        
        # Git repository'sini başlat
        subprocess.run(['git', 'init'], check=True)
        subprocess.run(['git', 'remote', 'add', 'origin', 'https://github.com/tugaycorekci9696/halisaha.git'], check=True)
        
    git_push() 
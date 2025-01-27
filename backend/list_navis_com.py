import winreg

def enum_prog_ids():
    with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, "") as key:
        i = 0
        while True:
            try:
                prog_id = winreg.EnumKey(key, i)
                if "navis" in prog_id.lower():
                    print(prog_id)
                i += 1
            except WindowsError:
                break

if __name__ == "__main__":
    print("Searching for Navisworks COM objects...")
    enum_prog_ids() 
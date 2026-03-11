require 'net/smtp'

smtp_host = "smtp.gmail.com"
smtp_port = 587
smtp_user = "saikiranbiradar0309@gmail.com"
smtp_pass_no_spaces = "koskempwslfsiawt"
smtp_pass_spaces = "kosk empw slfs iawt"

def test_auth(host, port, user, pass)
  smtp = Net::SMTP.new(host, port)
  smtp.enable_starttls
  begin
    smtp.start('localhost', user, pass, :login) do |s|
      puts "SUCCESS with password: '#{pass}'"
    end
  rescue => e
    puts "FAILED with password: '#{pass}' - Error: #{e.message}"
  end
end

puts "Testing without spaces..."
test_auth(smtp_host, smtp_port, smtp_user, smtp_pass_no_spaces)

puts "Testing with spaces..."
test_auth(smtp_host, smtp_port, smtp_user, smtp_pass_spaces)

require 'sinatra'
require 'json'
require 'net/smtp'

set :port, 8084
set :bind, '0.0.0.0'
set :protection, :host_authorization => { :permitted_hosts => [".*"] }

get '/health' do
  content_type :json
  { status: 'healthy' }.to_json
end

post '/notify' do
  request.body.rewind
  payload = JSON.parse(request.body.read)
  
  user_id = payload['user_id']
  email = payload['email']
  subject = payload['subject'] || "NexBank Notification"
  message = payload['message']
  
  if user_id.nil? || message.nil?
    status 400
    return { error: 'Missing user_id or message' }.to_json
  end
  
  # If email is provided, send a real email via SMTP
  if email && !email.empty?
    begin
      smtp_pass = ENV['SMTP_PASS']
      smtp_user = ENV['SMTP_USER'] || "your-email@gmail.com" # Default placeholder if not set
      smtp_host = ENV['SMTP_HOST'] || "smtp.gmail.com"
      smtp_port = (ENV['SMTP_PORT'] || 587).to_i

      if smtp_pass
        msg = <<~MESSAGE_END
          From: NexBank Security <#{smtp_user}>
          To: #{email}
          Subject: #{subject}

          #{message}
        MESSAGE_END

        smtp = Net::SMTP.new(smtp_host, smtp_port)
        smtp.enable_starttls
        smtp.start(smtp_host, smtp_user, smtp_pass, :login) do |s|
          s.send_message msg, smtp_user, email
        end
        puts "Real Email Sent via SMTP to #{email}: #{subject}"
      else
        puts "Warning: SMTP_PASS not set. Falling back to mock email."
        puts "Mock Email to #{email} - #{subject}: #{message}"
      end
    rescue => e
      puts "Failed to send SMTP email: #{e.message}"
    end
  else
    # Mock sending generic notification
    puts "--------------------------------------------------"
    puts "NOTIFICATION DISPATCHED"
    puts "To User: #{user_id}"
    puts "Message: #{message}"
    puts "--------------------------------------------------"
  end
  
  content_type :json
  { status: 'sent', user_id: user_id }.to_json
end

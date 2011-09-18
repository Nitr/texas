require 'rubygems'
require 'sinatra'

get '/test.png' do
  sleep(5)
  send_file 'test.png'
end

get '/test1.png' do
  sleep(2)
  send_file 'test.png'
end

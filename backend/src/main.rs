mod http;

use crate::http::{HTTPMethod, RequestHandler};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let server = TcpListener::bind(HOST_ADDRESS).await.unwrap();

    loop {
        if let Ok((stream, _)) = server.accept().await {
            tokio::spawn(async move {
                let mut handler = RequestHandler::new(stream);

                let request = handler.parse_http_request().await;

                if let Some(request) = request {
                    match request.path.as_str() {
                        "/" => match &request.method {
                            HTTPMethod::GET => {
                                if let Err(err) = handler.write_webpage().await {
                                    eprintln!("Error writing response {}", err)
                                }
                            }
                            _ => {
                                if let Err(err) = handler.write_405_response().await {
                                    eprintln!("Error writing response {}", err)
                                }
                            }
                        },
                        "/static/index.js" => match &request.method {
                            HTTPMethod::GET => {
                                if let Err(err) = handler.serve_bundle().await {
                                    eprintln!("Error writing response {}", err)
                                }
                            }
                            _ => {
                                if let Err(err) = handler.write_405_response().await {
                                    eprintln!("Error writing response {}", err)
                                }
                            }
                        },
                        _ => {
                            if let Err(err) = handler.write_404_response().await {
                                eprintln!("Error writing response {}", err)
                            }
                        }
                    }
                }
            });
        }
    }
}

pub const HOST_ADDRESS: &'static str = env!("HOST_ADDRESS");
pub const STATIC_PATH: &'static str = "../static";

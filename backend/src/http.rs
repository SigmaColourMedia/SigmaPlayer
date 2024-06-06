use crate::STATIC_PATH;
use std::fmt::{Display, Formatter};
use tokio::fs;
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpStream;

pub struct RequestHandler {
    pub stream: TcpStream,
}

impl RequestHandler {
    pub fn new(stream: TcpStream) -> Self {
        RequestHandler { stream }
    }

    pub async fn write_webpage(&mut self) -> std::io::Result<()> {
        let contents = fs::read_to_string(format!("{STATIC_PATH}/index.html")).await?;
        let response = format!(
            "HTTP/1.1 200 OK\r\n\
    content-length: {}\r\n\
    content-type: text/html\r\n\r\n\
    {}",
            contents.len(),
            contents
        );
        self.stream.write_all(response.as_bytes()).await
    }

    pub async fn serve_bundle(&mut self) -> std::io::Result<()> {
        let text_data = fs::read_to_string(format!("{STATIC_PATH}/index.js")).await?;

        let response = format!(
            "HTTP/1.1 200 OK\r\n\
        content-length:{content_length}\r\n\
        content-type:text/javascript\r\n\r\n\
        {text_data}",
            content_length = text_data.len(),
        );

        self.stream.write_all(response.as_bytes()).await
    }

    pub async fn write_405_response(&mut self) -> std::io::Result<()> {
        let status_line = "HTTP/1.1 405 METHOD NOT ALLOWED";

        let response = format! {"{status_line}\r\n\r\n"};
        self.stream.write_all(response.as_bytes()).await
    }

    pub async fn write_404_response(&mut self) -> std::io::Result<()> {
        let status_line = "HTTP/1.1 404 NOT FOUND";

        let response = format! {"{status_line}\r\n\r\n"};
        self.stream.write_all(response.as_bytes()).await
    }

    pub async fn parse_http_request(&mut self) -> Option<Request> {
        let buf_reader = BufReader::new(&mut self.stream);

        let mut lines = buf_reader.lines();
        let request_line = lines.next_line().await.ok().flatten()?;

        let req = request_line.split(" ").collect::<Vec<&str>>();
        let (method, pathname) = (req[0].to_owned(), req[1].to_owned());
        let method = match &method[..] {
            "GET" => HTTPMethod::GET,
            "POST" => HTTPMethod::POST,
            "OPTIONS" => HTTPMethod::OPTIONS,
            "DELETE" => HTTPMethod::DELETE,
            _ => {
                return None;
            }
        };

        let pathname_split = pathname.split_once("?");
        let (path, search) = match &pathname_split {
            Some((path, search)) => (path.to_string(), Some(search.to_string())),
            None => (pathname, None),
        };

        let mut headers: Vec<Header> = Vec::new();
        while let Some(line) = lines.next_line().await.ok().flatten() {
            if line.is_empty() {
                break;
            }
            headers.push(parse_header(&line)?)
        }
        let content_length = headers
            .iter()
            .find(|(key, _)| key.eq_ignore_ascii_case("content-length"))
            .map(|(_, value)| value.parse::<usize>())
            .map(|result| result.ok())
            .flatten();

        let body: Option<String> = match content_length {
            None => None,
            Some(length) => {
                let mut body = vec![0; length];
                lines.get_mut().read_exact(&mut body).await.ok()?;
                String::from_utf8(body).ok()
            }
        };

        Some(Request {
            method,
            headers,
            search,
            path,
            body,
        })
    }
}

// todo Don't hold the entire body in memory
#[derive(Debug)]
pub struct Request {
    pub path: String,
    pub search: Option<String>,
    pub method: HTTPMethod,
    pub headers: Vec<Header>,
    pub body: Option<String>,
}

type Header = (String, String);

fn parse_header(header: &str) -> Option<Header> {
    let (key, value) = header.split_once(":")?;
    let key = key.trim();
    let value = value.trim();

    Some((key.to_owned(), value.to_owned()))
}
impl Display for Request {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let msg = format!("{} {}", self.method, self.path);
        write!(f, "{}", &msg)
    }
}

#[derive(Debug)]
pub enum HTTPMethod {
    GET,
    POST,
    OPTIONS,
    DELETE,
}

impl Display for HTTPMethod {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            HTTPMethod::GET => write!(f, "GET"),
            HTTPMethod::POST => write!(f, "POST"),
            HTTPMethod::OPTIONS => write!(f, "OPTIONS"),
            HTTPMethod::DELETE => write!(f, "DELETE"),
        }
    }
}

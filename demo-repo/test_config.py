from config import get_timeout


def test_timeout_is_thirty_seconds():
    assert get_timeout() == 30
